const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const app = express()
const HTTP_FLV_REC = require('./libs/HTTP_FLV_REC')
const getURL = require('./libs/getURL/bilibili')
const serverChan = require('./libs/serverChan')
const options = require('../options')

function save(data, name) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(`./database/${name}.json`), JSON.stringify(data), 'utf-8', function(err) {
            if(err) reject(err)
            resolve()
        })
    })
}

function load(name) {
    return new Promise((resolve) => {
        fs.readFile(path.resolve(`./database/${name}.json`), 'utf-8', function(err, data) {
            if(err) {
                console.log(err)
                resolve({})
            }
            resolve((data)? JSON.parse(data) : data)
        })
    })
}

const recoders = {}
let tasklist = {}
let filelist = []

load('filelist')
.then(files => {
    filelist = (files instanceof Array)? files : []
    load('tasklist')
    .then(tasks => {
        if(tasks) {
            Object.values(tasks).forEach(item => {
                const filename = `${item.name}.stream.flv`
                filelist.push({
                    roomID: item.roomID,
                    used: item.used,
                    time: item.time,
                    name: item.name,
                    size: (fs.statSync(path.join(options.root, filename)) || {}).size,
                    download: `/record/${filename}`
                })
            })
        }
    })
    .catch(err => {
        console.log(err)
    })
})
.catch(err => {
    console.log(err)
})


app.use(bodyParser.json())

app.use(session({
  ////这里的name值得是cookie的name，默认cookie的name是：connect.sid
  name: 'live_recorder',
  secret: 'live_recorder_secret',
  cookie: ('name', 'value', {path: '/', httpOnly: true, secure: false, maxAge: 600000}),
  store: new FileStore(),
  //重新保存：强制会话保存即使是未修改的。默认为true但是得写上
  resave: true,
  //强制“未初始化”的会话保存到存储。
  saveUninitialized: true,
}));

app.use('/api/*', (req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': options.CORS,
        'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Credentials': 'true'
    })
    next()
})

app.use('/api/*', (req, res, next) => {
    if(/api\/login/.test(req.originalUrl)) {
        next();
    } else if(req.session.isLogin){
        next();
    } else {
        res.json({
            status: false,
            shouldLogin: false,
            msg: '请先登陆'
        })
    }
})

app.get('/api/record/:id', (req, res) => {
    const id = req.params.id
    if(tasklist[id]) {
        res.json({
            status: false,
            err: 'recording',
            msg: `房间[${id}]录制任务已存在！`
        })
    }
    getURL(id)
    .then(urls => {
        if(urls.length < 1) {
            res.json({
                status: false,
                msg: '没找到直播数据链接！'
            })
            return
        }
        
        const time = new Date().getTime()
        const name = `${id}_${time}`
        tasklist[id] = {
            roomID: id,
            urls,
            used: 0,
            time,
            name
        }
        recoders[id] = new HTTP_FLV_REC({
            ...options,
            name
        })
        function onerror(err) {
            console.log(err)
            const index = ++tasklist[id].used;
            serverChan(options.SCKEY, `**【日志】**录制房间\`[${id}]\`出错，正在切换到备用线路\`[${index}]\``);
            if(index < urls.length) {
                recoders[id].record(urls[index].url, onerror)
            } else {
                serverChan(options.SCKEY, `**【日志】**录制房间\`[${id}]\`失败`);
                recoders[id].fin()
                .then(() => {
                    const filename = `${tasklist[id].name}.stream.flv`
                    const file = {
                        roomID: id,
                        used: tasklist[id].used,
                        time: tasklist[id].time,
                        timeEnd: new Date().getTime(),
                        status: '出错了',
                        name: tasklist[id].name,
                        filename,
                        size: (fs.statSync(path.join(options.root, filename)) || {}).size,
                        download: `/record/${filename}`
                    }
                    filelist.unshift(file)
                    delete tasklist[id]
                    save(tasklist, 'tasklist')
                    save(filelist, 'filelist')
                })
                .catch(err => {
                    console.log(err)
                })
            }
        }
        recoders[id].record(urls[0].url, onerror)
        serverChan(options.SCKEY, `**【日志】**开始录制房间\`[${id}]\``);
        save(tasklist, 'tasklist')
        res.json({
            status: true,
            data: tasklist[id]
        })
    })
    .catch(err => {
        console.log(err)
        res.json({
            status: false,
            err
        })
    })
})

app.get('/api/stop/:id', (req, res) => {
    const {id} = req.params
    recoders[id].fin()
    .then(() => {
        const filename = `${tasklist[id].name}.stream.flv`
        const file = {
            roomID: id,
            used: tasklist[id].used,
            time: tasklist[id].time,
            timeEnd: new Date().getTime(),
            status: '已完成',
            name: tasklist[id].name,
            filename,
            size: (fs.statSync(path.join(options.root, filename)) || {}).size,
            download: `/record/${filename}`
        }
        filelist.unshift(file)
        delete tasklist[id]
        save(tasklist, 'tasklist')
        save(filelist, 'filelist')
        res.json({
            status: true,
            data: file
        })
    })
    .catch(err => {
        res.json({
            status: false,
            err
        })
    })
    
})

app.get('/api/tasklist', (req, res) => {
    res.json({
        status: true,
        data: Object.values(tasklist)
    })
})

app.get('/api/filelist', (req, res) => {
    res.json({
        status: true,
        data: filelist
    })
})

app.post('/api/del', (req, res) => {
    const {id, time} = req.body
    const index = filelist.findIndex(item => item.id === id && item.time === time)
    if(index > -1) {
        const info = filelist[index]
        fs.unlink(path.join(options.root, info.filename), ()=>{})
        filelist.splice(index, 1)
        save(filelist, 'filelist')
        res.json({
            status: true
        })
    } else {
        res.json({
            status: false
        })
    }
})

app.post('/api/login', (req, res) => {
    if(options.netkey === req.body.netkey) {
        req.session.isLogin = true
        res.json({status: true})
    } else {
        res.json({status: false, msg: '密码错误'})
    }
})

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({status: true})
})

app.get('/api/isLogin', (req, res) => {
    res.json({status: true})
})


app.use(express.static(path.join(__dirname, '../view')));
app.use('/record', express.static(options.root));

app.listen(options.port, () => {
    console.log(`Server is now running in localhost: ${options.port}`);
});

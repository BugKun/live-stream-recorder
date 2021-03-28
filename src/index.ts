import fs from 'fs'
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
const app = express()
import AutoRecord from './services/autoRecord'
const options = require(path.resolve('options'))
const liveRoomPath = path.resolve('live-room.json')
let liveRoom = require(liveRoomPath)
const recordData = Object.fromEntries(
    liveRoom.map(item => {
        const autoRecord = new AutoRecord({
            ...options,
            outputPath: options.root,
            ...item
        })
        autoRecord.startMonitoring()
        return [
            item.id,
            autoRecord
        ]
    })
)

function updateLiveRoom(data): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(liveRoomPath, JSON.stringify(data), function(err) {
            if(err) {
                reject(err)
            } else {
                liveRoom = data
                resolve()
            }
        })
    })
}


app.use(bodyParser.json())

app.post('/api/resume/:id', (req, res) => {
    const id = req.params.id
    recordData[id].startMonitoring()
    res.json({code: 0})
})

app.post('/api/stop/:id', (req, res) => {
    const {id} = req.params
    recordData[id].pauseMonitoring()
    recordData[id].endRecord()
    res.json({code: 0})
})

app.get('/api/recordList', (req, res) => {
    res.json({
        code: 0,
        data: Object.entries(recordData).map(item => ({
            id: item[0],
            // @ts-ignore
            ...item[1].state
        }))
    })
})

app.post('/api/addRecord', (req, res) => {
    const id = Math.max(...liveRoom.map(item => item.id)) + 1
    recordData[id] =  new AutoRecord({
        ...req.body
    })
    res.json({
        code: 0
    })
})

app.post('/api/delRecord/:id', (req, res) => {
    const id = req.params.id
    if(recordData[id]) {
        recordData[id].destroy()
    }
    updateLiveRoom(liveRoom.filter(item => item.id != id))
    res.json({
        code: 0
    })
})


app.use(express.static(path.join(__dirname, '../view')));

app.listen(options.port, () => {
    console.log(`Server is now running in localhost: ${options.port}`);
});

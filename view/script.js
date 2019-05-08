const baseURL = 'http://router.nopast.cn:12233'
const ajax = axios.create({
    baseURL,
    timeout: 5000,
    withCredentials: location.origin !== baseURL
})

const fixLength = (_str, len) => {
    const str = (typeof _str === "string") ? _str : String(_str);
    return (str.length < len) ? ((new Array(len + 1)).join('0') + str).slice(-len) : str;
}

const dateFormat = (_date, format) => {
    const date = _date instanceof Date ? _date : new Date(_date);
    const dateExtra = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": fixLength(date.getHours(), 2),
        "m+": fixLength(date.getMinutes(), 2),
        "s+": fixLength(date.getSeconds(), 2),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S+": date.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, date.getFullYear().toString().substr(4 - RegExp.$1.length));
    }
    for (let k in dateExtra) {
        if (new RegExp(`(${k})`).test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? dateExtra[k] : (`00${dateExtra[k]}`).substr(dateExtra[k].toString().length));
        }
    }
    return format;
}

new Vue({
    el: '#app',
    data: {
        isLogin: false,
        netkey: '',
        search: '',
        tasklist: [],
        filelist: [],
        baseURL
    },
    created() {
        // 请求响应拦截器
        ajax
        .interceptors
        .response
        .use((response) => {
            // TODO
            let { data } = response
            if(data.shouldLogin) {
                this.isLogin = false
            }
            if(data.status === false && data.msg) {
                alert(data.msg)
            } else {
                console.log(data.err)
            }
            return data
        }, (error) => {
            console.log(error)
        })
        this.getLoginStatus()
    },
    watch: {
        isLogin(curVal) {
            if(curVal) {
                this.getTaskList();
                this.getFileList();
            }
        }
    },
    methods: {
        dateFormat,
        sizeConverter(int, time = 0){
            if(Math.floor(int) < 1024){
                let str;
                switch (time){
                    case 0:
                        str = " B";
                        break;
                    case 1:
                        str = " KB";
                        break;
                    case 2:
                        str = " MB";
                        break;
                    case 3:
                        str = " GB";
                        break;
                }
                return Math.floor(int * 100) / 100 + str;
            }else{
                return this.sizeConverter(int/1024, ++time);
            }
        },
        getLoginStatus() {
            ajax({
                method: 'GET',
                url: `/api/isLogin`
            })
            .then(res => {
                if (res.status) {
                    this.isLogin = res.status
                }
            })
        },
        getTaskList() {
            ajax({
                method: 'GET',
                url: `/api/tasklist`
            })
            .then(res => {
                if (res.status) {
                    this.tasklist = res.data.reverse()
                }
            })
        },
        getFileList() {
            ajax({
                method: 'GET',
                url: `/api/filelist`
            })
            .then(res => {
                if (res.status) {
                    this.filelist = res.data
                }
            })
        },
        add() {
            const roomID = prompt("请输入房间ID")
            if(roomID && roomID !== '') {
                if(this.tasklist.some(item => item.roomID === roomID)) {
                    alert(`房间[${roomID}]录制任务已存在！`)
                    return
                }
                ajax({
                    method: 'GET',
                    url: `/api/record/${roomID}`
                })
                .then(res => {
                    if (res.status) {
                        this.tasklist.unshift(res.data)
                    }
                })
            }
        },
        stop(roomID) {
            if(confirm('确定要停止吗？')) {
                ajax({
                    method: 'GET',
                    url: `/api/stop/${roomID}`
                })
                .then(res => {
                    if (res.status) {
                        this.tasklist = this.tasklist.filter(item => item.roomID !== roomID)
                        this.filelist.unshift(res.data)
                    }
                })
            }
        },
        del(roomID, time) {
            if(confirm('确定要删除吗？')) {
                ajax({
                    method: 'POST',
                    url: `/api/del`,
                    data: {
                        roomID,
                        time
                    }
                })
                .then(res => {
                    if (res.status) {
                        this.filelist = this.filelist.filter(item => item.id !== roomID && item.time !== time)
                    }
                })
            }
        },
        login() {
            ajax({
                method: 'POST',
                url: `/api/login`,
                data: {
                    netkey: md5(this.netkey)
                }
            })
            .then(res => {
                if (res.status) {
                    this.isLogin = true
                }
            })
        },
        logout() {
            if(confirm('确定退出登陆吗？')) {
                ajax({
                    method: 'GET',
                    url: `/api/logout`
                })
                .then(res => {
                    if (res.status) {
                        this.isLogin = false
                    }
                })
            }
        }
    }
})
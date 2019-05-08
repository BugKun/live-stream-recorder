const request = require('request')

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; 

const options = {
    headers: {
        ['User-Agent']: 'request',
        Accept: '*/*'
    },
    // proxy: 'http://127.0.0.1:8888'
}

module.exports = (id) => {
    return new Promise((resolve, reject) => {
        request({url: `https://live.bilibili.com/${id}`, ...options}, (err, res, body) => {
            if(err) reject(err)
            if(body && body !== "") {
                const __NEPTUNE_IS_MY_WAIFU__ = body.match(/\<script\>window\.\_\_NEPTUNE\_IS\_MY\_WAIFU\_\_\=\{*.+\}/)
                if(__NEPTUNE_IS_MY_WAIFU__) {
                    const durl = __NEPTUNE_IS_MY_WAIFU__[0].match(/\"durl\"\:\[(?:.*?)]/)
                    if(durl) {
                        const urls = JSON.parse(durl[0].replace('"durl":', ''))
                        resolve(urls || [])
                    }
                }
                resolve([])
            } else {
                reject()
            }
        })
    })
}
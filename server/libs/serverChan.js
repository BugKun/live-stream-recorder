const request = require('request');

module.exports = (SCKEY, desp) => {
    return new Promise((resolve, reject) => {
        console.log(desp);
        request({
            method: "POST",
            url: `https://sc.ftqq.com/${SCKEY}.send`,
            form: {
                text: 'Live Recorder: ',
                desp
            }
        },(err, res, body) => {
            reject(err)
            resolve(body)
        })
    })
}
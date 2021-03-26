import request from '@Utils/request';

module.exports = async (desp: string) => {
    console.log(desp)
    return request({
        url: ``,
        method: "POST",
        body: {
            text: 'Live Recorder: ',
            desp
        },
        json: true
    })
}

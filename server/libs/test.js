const HTTP_FLV_REC = require('./HTTP_FLV_REC');


const REC = new HTTP_FLV_REC({
        root: './record',
        name: 'test_01',
        ffmpegPath: './ffmpeg/ffmpeg.exe',
        fprobePath: './ffmpeg/ffprobe.exe'
});
const url = '';
// const task = setTimeout(() => {
//     console.log('停止录制，等待10秒继续录制');
//     REC.pause();
//     setTimeout(() => {
//         console.log('开始录制');
//         REC.record(url, (err) =>{
//             console.log(err);
//         })
//         setTimeout(() => {
//             REC.fin();
//             console.log('停止录制');
//         }, 10 * 1000);
//     }, 10 * 1000);
// }, 10 * 1000);
REC.record(url)
// REC.record(url, (err) =>{
//     console.log(err);
//     clearTimeout(task);
// })
// console.log('10秒后停止录制')

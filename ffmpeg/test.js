var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('./ffmpeg.exe')
ffmpeg.setFfprobePath('./ffprobe.exe')


var command = ffmpeg('live_video.flv')
    .audioCodec('copy')
  .videoCodec('copy')
  .format('mp4')
  .on('end', function() {
    console.log('file has been converted succesfully');
  })
  .on('error', function(err) {
    console.log('an error happened: ' + err.message);
  })
  .save('outtest.mp4');
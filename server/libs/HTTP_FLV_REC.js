const https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    URL = require('url'),
    ffmpeg = require('fluent-ffmpeg');


module.exports = class HTTP_FLV_REC {
    constructor({root, name, ffmpegPath, fprobePath}) {
        this.realpath = path.resolve(root, name);
        this.tempPath = [`${this.realpath}.stream.flv`];
        if(ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath)
        if(fprobePath) ffmpeg.setFfprobePath(fprobePath)
    }

    record(url, onerror) {
        this.fin()
        .then(() => {
            const protocol = URL.parse(url).protocol;
            if(protocol === 'https:') {
                this.request = https.get(url).setTimeout(5000);
            }
            if(protocol === 'http:') {
                this.request = http.get(url).setTimeout(5000);
            }
            this.recording = fs.createWriteStream(this.tempPath[this.tempPath.length - 1]);
            if(!this.request) {
                if(typeof onerror === 'function') onerror('地址无效');
                return;
            }
            this.request.on('response', (res) => {
                res.pipe(this.recording);
                res.on('end', () => {
                    if(typeof onerror === 'function') onerror('地址无效');
                });
                res.on('error', (err) => {
                    if(typeof onerror === 'function') onerror(err);
                });
            }).on('error', (err) => {
                if(typeof onerror === 'function') onerror(err);
            });
        })
    }

    fin(convert) {
        return new Promise((reslove, reject) => {
            if(this.request) {
                this.request.abort();
                this.request.end();
                this.request = null;
            }
            if(this.recording) {
                this.recording.end();
                this.recording = null;
            }
            if(convert) {
                this.convert(this.tempPath, this.realpath + '.mp4')
                .then((e) => {
                    fs.unlinkSync(this.tempPath);
                    reslove(e);
                })
                .catch(reject)
            } else {
                reslove();
            }
        })
    }

    join(eachPath) {
        return new Promise((reslove, reject) => {
            ffmpeg(convertPath)
                .audioCodec('copy')
                .videoCodec('copy')
                .format(format)
                .on('end', reslove)
                .on('error', reject)
                .save(savePath);
        })
    }

    convert(convertPath, savePath, format = 'mp4') {
        return new Promise((reslove, reject) => {
            ffmpeg(convertPath)
                .audioCodec('copy')
                .videoCodec('copy')
                .format(format)
                .on('end', reslove)
                .on('error', reject)
                .save(savePath);
        })
    }
}



/* .on('end', function() {
    console.log('file has been converted succesfully');
})
.on('error', function(err) {
    console.log('an error happened: ' + err.message);
}) */
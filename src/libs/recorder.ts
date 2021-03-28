import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs-extra'

function toFFmpegHttpHeader(headers: {[key: string]: string}): string {
    return '"' + Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join('\r\n') + '"'
}

export default async function (options) {
    console.log(options, 'options')
    await fs.ensureDir(options.fileDir)
    const headers = {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
        ...options.headers
    }
  
    const ffmpeg = spawn(
        options.ffmpegPath,
        [
            '-headers',
            toFFmpegHttpHeader(headers),
            '-i',
            options.url,
            '-c:v',
            'copy',
            '-c:a',
            'copy',
            '-y',
            path.join(options.fileDir, `${options.filename}.flv`)
        ]
    )
    let errorDataRaw:Buffer

    ffmpeg.stdout.on('data', (data) => {
        options.onStdout && options.onStdout(data)
    });

    ffmpeg.stderr.on('data', (data) => {
        options.onStderr && options.onStderr(data)
        errorDataRaw = data
    });

    ffmpeg.on('close', (code) => {
        options.onClose && options.onClose(code)
    });

    return {
        stop() {
            ffmpeg.kill('SIGINT');
        }
    }
}

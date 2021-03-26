import recorder from '../libs/recorder'
import path from 'path';
import dayjs from 'dayjs';
import {liveInfoTypes, providerParams} from '@Types';


export interface optionsTypes extends providerParams{
    outputPath: string
    provider: string
    ffmpegPath: string
    interval: number
    headers: {
        [key: string]: string
    }
}

export interface stateTypes {
    isRecording: boolean
    lastCheckTime: number
    lastRecordStartTime: number
    isMoniting: boolean
    log: string
    timer: NodeJS.Timeout
}

export default class AutoRecord {
    protected options: optionsTypes
    protected state: stateTypes
    protected provider: Function
    protected recorder: any

    constructor(options: optionsTypes) {
        this.options = options
        this.provider = require(`./provider/${options.provider}`).default
        this.state = {
            isMoniting: false,
            isRecording: false,
            lastCheckTime: 0,
            lastRecordStartTime: 0,
            log: '',
            timer: null,
        }
    }


    async startMonitoring() {
        if(!this.state.isMoniting) {
            this.state.isMoniting = true
            await this.autoRecord(this.options)
            this.state.lastCheckTime = Date.now()
            this.state.timer = setTimeout(() => {
                this.startMonitoring()
            }, this.options.interval)
        }
    }

    pauseMonitoring() {
        this.state.isMoniting = false
        clearTimeout(this.state.timer)
    }

    async autoRecord(config: providerParams) {
        if(!this.state.isRecording) {
            const info: liveInfoTypes = await this.provider(config)
            if(info.liveStatus) {
                this.startRecord(info)
            }
        }
    }

    startRecord(info: liveInfoTypes) {
        this.state.isRecording = true
        this.state.lastRecordStartTime = Date.now()
        this.recorder = recorder({
            url: info.urls[0],
            ffmpegPath: this.options.ffmpegPath,
            fileDir: path.join(this.options.outputPath, `${info.uid}-${info.username}`),
            filename: `直播录制-${info.uid}-${info.username}-${dayjs().format('YYYY-MM-DD_HH:mm:ss')}-${info.title}`,
            onStdout(data: Buffer) {
                this.state.log += data.toString() + '\n'
            },
            onStderr(data: Buffer) {
                this.state.log += data.toString() + '\n'
            },
            onClose() {
                this.state.isRecording = false
                this.recorder = null
            },
            headers: info.headers
        })
    }

    endRecord() {
        if(this.recorder) {
            this.recorder.stop()
            this.state.isRecording = false
            this.recorder = null
        }
    }

    destroy() {
        this.endRecord()
        this.options = null
        this.state = null
        this.provider = null
    }
}

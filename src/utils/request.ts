import simpleGet from 'simple-get'
import type http from 'http'

export interface configTypes extends http.RequestOptions{
    url: string
    [key: string]: any
}

export default function request(config: configTypes): Promise<any> {
    return new Promise((resolve, reject) => {
        simpleGet.concat({timeout: 60000, ...config}, function(err: Error, res: http.ServerResponse, dataRaw: string) {
            if(err) {
                reject(err)
            } else {
                try {
                    const data = JSON.parse(dataRaw)
                    resolve(data)
                } catch (err) {
                    resolve(dataRaw)
                }
            }
        })
    })
}

import request from '@Utils/request';
import {liveInfoTypes, providerParams} from '@Types';

export default async function getLiveInfo({liveRoomId}: providerParams): Promise<liveInfoTypes> {
    const liveStatusResponse = await request({
        url: liveRoomId + ''
    })
    const liveStatus = liveStatusResponse.data
    const result: liveInfoTypes = {
        uid: liveStatus.uid,
        username: '',
        urls: [],
        title: liveStatus.title,
        liveStatus: liveStatus.live_status,
        headers: {}
    }
    const userInfoResponse = await request({
        url: liveRoomId + ''
    })
    const userInfo = userInfoResponse.data
    result.username = userInfo.username
    if(liveStatus.live_status) {
        const liveUrlResponse = await request({
            url: liveRoomId + ''
        })
        const liveUrl = liveUrlResponse.data
        result.urls = liveUrl.durl.map(item => item.url)
    }
    return result
}

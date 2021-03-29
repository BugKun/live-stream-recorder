import request from '@Utils/request';
import {liveInfoTypes, providerParams} from '@Types';

export default async function getLiveInfo({liveRoomId}: providerParams): Promise<liveInfoTypes> {
    const liveStatusResponse = await request({
        url: `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${liveRoomId}`
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
        url: `https://api.bilibili.com/x/space/acc/info?mid=${liveStatus.uid}`
    })
    const userInfo = userInfoResponse.data
    result.username = userInfo.name
    if(liveStatus.live_status) {
        const liveUrlResponse = await request({
            url: `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${liveRoomId}&otype=json&quality=0`
        })
        const liveUrl = liveUrlResponse.data
        result.urls = liveUrl.durl.map(item => item.url)
    }
    return result
}

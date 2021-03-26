export interface liveInfoTypes {
    uid: number
    username: string
    title: string
    urls: string[]
    liveStatus: number
    headers: {
        [key: string]: string
    }
}

export interface providerParams {
    liveRoomId: number
}

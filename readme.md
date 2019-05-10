# Live Stream Recorder
一个自给自足的项目，主要是用来录制直播视频的。暂时只做了B站的直播录制，但核心录制模块是支持HTTP-FLV的录制的。

**Options(options.js)**

|Name|Type|Default|Required|Description|
|:--:|:--:|:-----:|:-----:|:----------|
|**[`root`](#)**|`{String}`| | true |直播录制的根目录|
|**[`ffmpegPath`](#)**|`{String}`| | true |ffmepg的路径|
|**[`fprobePath`](#)**|`{String}`| | true |fprobe的路径|
|**[`port`](#)**|`{String}`| | true |网页服务运行的端口|
|**[`netkey`](#)**|`{String}`| | true |使用服务所需的密钥|
|**[`CORS`](#)**|`{String}`| | false |允许跨域的地址|
|**[`SCKEY`](#)**|`{String}`| | true |server酱的SCKEY|

***
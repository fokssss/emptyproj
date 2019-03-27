const defaultTicketServer = "http://10.3.13.9:88/wechat/api/getticket"
const jsapi_list = [
  'updateAppMessageShareData',
  'updateTimelineShareData',
  'onMenuShareWeibo',
  'onMenuShareQZone',
  'startRecord',
  'stopRecord',
  'onVoiceRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'onVoicePlayEnd',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'translateVoice',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard'
]

// 加载 .js 文件
function loadJsFile(src) {
  return new Promise(resolve => {
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = resolve;
    head.appendChild(script);
  });
}

// 读取 json 文件
function readJsonFile(file) {
  return new Promise(resolve => {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        resolve(rawFile.responseText);
      }
    }
    rawFile.send(null);
  })
}

// http 请求
function get(url) {
  return new Promise((resolve, reject) => {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        // 成功完成
        if (request.status === 200) {
          return resolve(request.responseText);
        }
        else {
          return reject(request.status);
        }
      }
      else {
        // HTTP请求还在继续...
      }
    }
    request.open('GET', url);
    request.send();
  });
}

// 请求 ticket
function getJsApiTicket(data) {
  let url = null
  if (data.access_token_source == 'debug') {
    url = defaultTicketServer + "?access_token_source=debug"
  }
  else if (data.access_token_source == 'url') {
    url = data.url
  }
  else if (data.access_token_source == 'secret') {
    let appid = data.appid
    let secret = data.secret
    url = `${defaultTicketServer}?access_token_source=secret&appid=${appid}&secret=${secret}`
  }
  return get(url).then(res => {
    return new Promise((resolve, reject) => {
      resolve(res)
    });
  })
}

class MTL {
  constructor() {
    this.isReady = false
    this.loadJsapi()
  }

  configPermission(callback) {
    if (this.isReady) {
      callback({
        code: 0,
        response: '已申请过权限',
        error: null
      })
    }
    else {
      this._configPermission().then(res => {
        callback({
          code: 0,
          response: res,
          error: null
        })
        this.isReady = true
      }).catch(err => {
        callback({
          code: 1,
          response: null,
          error: err
        })
      })
    }
  }

  loadJsapi() {
    for (let api of jsapi_list) {
      this[api] = wx[api]
    }
  }

  async _configPermission() {
    await loadJsFile('./sign.bundle.js')  // TODO: 改文件名为 sha1.bundle.js
    let data = await readJsonFile('./mtl.jsapi.config.json')
    return getJsApiTicket(JSON.parse(data)).then(res => {
      return new Promise((resolve, reject) => {
        let json = JSON.parse(res)
        let { status, msg, data } = json
        if (status == 0) {
          reject(msg)
          return
        }
        let { appid, ticket } = data
        let url = document.URL
        let nonceStr = 'Wm3WZYTPz0wzccnW'
        let timestamp = new Date().getTime()
        let encodingStr = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
        let signature = window.sha1(encodingStr);

        let config = {
          debug: false,         // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: appid,         // 必填，公众号的唯一标识
          timestamp: timestamp, // 必填，生成签名的时间戳
          nonceStr: nonceStr,   // 必填，生成签名的随机串
          signature: signature, // 必填，签名
          jsApiList: jsapi_list // 必填，需要使用的JS接口列表
        }
        wx.config(config);
        wx.ready(resolve);
        wx.error(reject);
      })
    })
  }
}
this.mtl = new MTL()
function getLocation() {
  mtl.configPermission(function ({ code, response, error }) {
    if (code == 0) {
      mtl.getLocation({
        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: function (res) {
          var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
          var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
          var speed = res.speed; // 速度，以米/每秒计
          var accuracy = res.accuracy; // 位置精度
          alert(latitude + ', ' + longitude)
        }
      });
    }
  })
}

function chooseImage() {
  mtl.configPermission(function ({ code, response, error }) {
    if (code == 0) {
      mtl.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'],      // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          var localIds = res.localIds;        // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          alert('localIds: ' + localIds)
        }
      });
    }
  })
}

function previewImage() {
  mtl.configPermission(function ({ code, response, error }) {
    if (code == 0) {
      mtl.previewImage({
        current: 'https://ss3.baidu.com/9fo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=eb2a0d90c311728b2f2d8a22f8fcc3b3/eac4b74543a98226f5d6a9268482b9014a90eb98.jpg', // 当前显示图片的http链接
        urls: ['https://ss3.baidu.com/9fo3dSag_xI4khGko9WTAnF6hhy/image/h%3D300/sign=eb2a0d90c311728b2f2d8a22f8fcc3b3/eac4b74543a98226f5d6a9268482b9014a90eb98.jpg'] // 需要预览的图片http链接列表
      });
    }
  })
}

function onApiAction(action) {
  eval(action + '()')
}
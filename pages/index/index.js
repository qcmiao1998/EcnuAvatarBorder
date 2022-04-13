const app = getApp()

Page({
  data: {
    platform: "",
    copperload: false,
    cropperhidden: "hidden",
    useravatar: "",
    borders: [],
    activeborder: "",
    exportbtnMode: 1,
    savetemplate: {},
    sharetemplate: {},
    titlemargin: 0,
    pixelRatio: 1,
  },
  onLoad() {
    app.globalData.INDEX = this;

    let borders = [];
    for (let i = 1; i <= 15; i++) {
      borders.push(`/images/borders/${i}.png`);
    }
    this.setData({
      borders
    });

    const res = wx.getSystemInfoSync();
    this.setData({
      platform: res.platform
    });
    this.isPc = res.platform === "windows" || res.platform === "mac";
    this.setData({
      platform: res.platform,
      pixelRatio: this.isPc? res.pixelRatio:1
    });

    console.info(res);

    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  onTitleReady() {
    if (this.isPc) return;

    wx.createSelectorQuery().select('#container').boundingClientRect(container => {
      wx.createSelectorQuery().selectViewport().boundingClientRect(view => {
        // console.info("body:",rect.height," screen:", view.height);
        if (container.height < container.height) {
          return;
        }

        let ratio = (container.height - view.height) / view.width * 100;

        ratio = ratio < 14 ? ratio:14;

        this.setData({
          titlemargin: ratio
        });
      }).exec();
    }).exec();
  },
  onShareAppMessage(event) {
    if (event.from == "menu") {
      return {
        "title": "点击换中国科大专属头像",
        "imageUrl": "/images/shareimg.png",
      };
    }

    const promise = new Promise(resolve => {
      this.sharePromise = resolve;
    })

    const template = {
      "width": "550px",
      "height": "440px",
      "background": "#FFFFFF",
      "views": [
        {
          "type": "image",
          "url": "/images/shareback.png",
          "css": {
            "width": "550px",
            "height": "440px",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url": this.data.useravatar,
          "css": {
            "width": "300px",
            "height": "300px",
            "top": "70px",
            "left": "125px",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url": this.data.activeborder,
          "css": {
            "width": "300px",
            "height": "300px",
            "top": "70px",
            "left": "125px",
            "mode": "scaleToFill"
          }
        }
      ]
    };

    this.setData({
      sharetemplate: template
    });

    return {
      "title": "点击换中国科大专属头像",
      "imageUrl": "/images/shareimg.png",
      promise
    };
  },
  bindShareImageOk(event) {
    if (this.sharePromise) {
      this.sharePromise({
        "title": "点击换中国科大专属头像",
        "imageUrl": event.detail.path
      });
    }
  },
  onShareTimeline() {
    return {
      "title": "点击换中国科大专属头像",
    };
  },
  bindchooseimage() {
    if (this.data.copperload) {
      this.setData({
        copperload: false
      });
    }
    this.setData({
      copperload: true
    });
  },
  bindcropperload() {
    this.cropper = this.selectComponent("#image-cropper");
    this.cropper.upload();
  },
  bindcropperloadimage() {
    this.setData({
      cropperhidden: ""
    });
    wx.hideLoading();
  },
  bindCrop(){
    wx.showLoading({
      title: '加载中...'
    });
    this.cropper.getImg(res => {
      this.setData({
        cropperhidden: "hidden",
        copperload: false,
        useravatar: res.url
      });
      wx.hideLoading();
    });
  },
  bindCancelCrop(){
    this.setData({
      cropperhidden: "hidden",
      copperload: false
    });
  },
  bindSelectBorder(event) {
    // if (!this.data.useravatar) {
    //   wx.showToast({
    //     title: "请先选择头像图片",
    //     icon: "none",
    //   });
    //   return;
    // }
    const id = event.currentTarget.dataset.index;
    this.setData({
      activeborder: this.data.borders[id],
      exportbtnMode: 1,
    });
  },
  openSetting() {
    wx.openSetting();
    this.setData({
      exportbtnMode: 1,
    });
  },
  bindExport() {
    wx.showLoading({
      title: '生成中...'
    });
    const template = {
      "width": "300px",
      "height": "300px",
      "background": "#FFFFFF",
      "views": [
        {
          "type": "image",
          "url": this.data.useravatar,
          "css": {
            "width": "300px",
            "height": "300px",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url": this.data.activeborder,
          "css": {
            "width": "300px",
            "height": "300px",
            "mode": "scaleToFill"
          }
        }
      ]
    };
    this.setData({
      savetemplate: template
    });
  },
  bindSaveImageOk(event) {
    wx.hideLoading();
    let path = event.detail.path;
    console.info(path)
    if (!path.endsWith(".png")) {
      wx.getFileSystemManager().copyFileSync(
        path,
        path = `${wx.env.USER_DATA_PATH}/ecnu70avatar.png`
      );
    }
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success() {
        console.log("Saved");
        app.globalData.INDEX.setData({
          exportbtnMode: 2
        });
      },
      fail(res) {
        console.log(res.errMsg)
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              app.globalData.INDEX.setData({
                exportbtnMode: 3
              });
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  app.globalData.INDEX.setData({
                    exportbtnMode: 1
                  });
                },
                fail() {
                  console.error("Authorization Failed");
                  app.globalData.INDEX.setData({
                    exportbtnMode: 3
                  });
                }
              });
            }
          } // wx.getSetting.success
        }); // wx.getSetting
      } // wx.saveImageToPhotosAlbum.fail
    }); // wx.saveImageToPhotosAlbum
  },
})

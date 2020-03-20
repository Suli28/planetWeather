var that;

// 引入腾讯位置服务的SDK核心类
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');

// 实例化核心类
var qqmapsdk = new QQMapWX({
  key: 'X4EBZ-XPJCF-KFHJ7-NYCZ2-FHBG2-ZFBGJ' // 必填
});  

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ipt_value:"",

    //是否将数据存到缓存中的
    flag:false
  },
  
  // 用户输入完成事件
  finish:function(res){

    if (res.detail.value.indexOf("市") != -1 || res.detail.value.indexOf("区") != -1 ){
      wx.showToast({
        title: '城市名称不要带市和区',
      })
    }else{
      that.getOneWeather(res.detail.value);
      that.getAllWeather(res.detail.value);
    }

    //清空输入框中的内容
    that.setData({
      ipt_value:""
    })
  },

  // 获取自身位置天气
  get_city:function(){
    // 腾讯位置服务的逆地址解析
    qqmapsdk.reverseGeocoder({
      // 成功
      success:res =>{
        that.setData({
          // 将数据存到缓存中
          flag:true
        })
      //  查询的天气信息，不能带市和区 "天河区".slice(0,-1)
        var city = res.result.address_component.district.slice(0,-1);//天河

        
        // 逆地址解析成功，再获取天气 
        that.getOneWeather(city);
        that.getAllWeather(city);
      },
      // 失败
      fail:err =>{
        wx.showModal({
          title: '小程序需要定位权限',
          content: '你的位置信息将用于获取当前城市的天气',
          cancelText: '不需要',
          confirmText: '去授权',
          success: function(res) {
            // 用户不给权限
            if(res.cancel){
              // 重新回调逆地址解析
              that.get_city();

            }else{
              // 打开授权窗口
              wx.openSetting({
                // 授权结束
                complete:() =>{
                  // 重新回调逆地址解析
                  that.get_city();
                }
              })
            }
          }
        })
      }
    })
  },

  // 实况天气
  getOneWeather:function(c){
    // ajax
    wx.request({
      url:"https://tianqiapi.com/api",
      method:"GET",
      data:{
        appid:86682744,
        appsecret:"iUfXN1be",
        version:"v6",
        city:c
      },
      dataType:"json",
      success:res =>{
        // console.log(+new Date())
        // console.log(new Date().getTime())

        console.log("实况天气=>",res.data);
        if (that.data.flag) { //flag 为true 存缓存
            // 缓存的过期时间
            wx.setStorage({
              key:"out_time",
              data: Date.parse(new Date())+1800000
            })

            // 实况天气
            wx.setStorage({
              key:"oneweather",
              data: res.data
            })

            
        }else{
          that.setData({
            one:res.data
          })
        }
      },
      complete:() =>{
        // 从缓存里面拿数据
        if(that.data.flag){
          that.getOneStorage();
        }
      }
      
    })
  },

  // 七日天气
  getAllWeather:function(c){
    wx.request({
      url: 'https://tianqiapi.com/api',
      method:"GET",
      data:{
        appid: 86682744,
        appsecret: "iUfXN1be",
        version: "v1",
        city: c
      },
      dataType:"json",
      success:res =>{
        console.log("七日天气=>",res);
        if (that.data.flag) { //flag 为true 存缓存
          wx.setStorage({
            key: 'allweather',
            data: res.data,
          })
        }else{
          that.setData({
            all:res.data
          })
        }
      },
      complete:() =>{
        if(that.data.flag){
          that.getAllStorage();
        }
      }
    })
  },

  // 判断天气缓存是否过期了
  init:function(){
    // 获取缓存信息
    wx.getStorage({
      key:"out_time",

      // 有过期时间缓存, res.data是缓存中的过期时间
      success:res =>{
        // 获取当前时间
        var nowTime = Date.parse(new Date());
        if (res.data - nowTime <=0){
          console.log("缓存过期");
          // 逆地址解析
          that.get_city();
        }else{
          console.log("获取缓存中的数据");

          // 获取缓存中的数据
          that.getOneStorage();
          that.getAllStorage();
        }
      },
      // 没有过期时间缓存
      fail:err =>{
        //  逆地址解析，解析成功会自动调用天气
        that.get_city();
      }
    })
  },

  // 拿到缓存中的数据，并且存到data里面
  // 获取一天缓存
  getOneStorage: function () {
    wx.getStorage({
      key: 'oneweather',
      success: function (res) {
        that.setData({
          one: res.data
        })
        console.log("data中的实况天气 =>",that.data.one)
      },
    })
  },


  // 获取七天缓存
  getAllStorage: function () {
    wx.getStorage({
      key: 'allweather',
      success: function (res) {
        console.log("关闭false")
        
        that.setData({
          all: res.data,
          date: res.data.update_time.substring(5,16),
          flag:false
        })

        // 停止下拉动作
        wx.stopPullDownRefresh();

        console.log("data中的7日天气 =>", that.data.all);
      },
      fail:res =>{
        console.log(res);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;

    that.init();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 用户下拉以后，更新缓存中的数据
    that.get_city();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

  
})
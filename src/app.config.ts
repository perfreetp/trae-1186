export default defineAppConfig({
  pages: [
    'pages/scan/index',
    'pages/trace/index',
    'pages/recall/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/timeline/index',
    'pages/receive/index',
    'pages/report/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2563eb',
    navigationBarTitleText: '药品追溯助手',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#2563eb',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/scan/index',
        text: '扫码核验'
      },
      {
        pagePath: 'pages/trace/index',
        text: '追溯查询'
      },
      {
        pagePath: 'pages/recall/index',
        text: '召回提醒'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})

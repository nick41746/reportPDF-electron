var jsreport = require('jsreport-core')({
  "assets": {
    allowedFiles: '**/*.*',
    publickAccessEnabled: true,
    searchOnDiskIfNotFoundInStore: true,
  }
});
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
app.set('port', (process.env.PORT || 4000))
//jsreport.use(require('jsreport-electron-pdf')({
  // strategy: 'electron-ipc',
//}))
//jsreport.use(require('jsreport-jsrender')())
app.get('/bot', (req, res) => {
  sendText(res)
})

var fs = require('fs')
function sendText (res) {
  jsreport.init().then(function () {
    var buff = fs.readFileSync('src/index.html', 'utf8')
    var style = fs.readFileSync('src/style.css', 'utf8')
    return jsreport.render({
      template: {
        content: buff,
        engine: 'jsrender',
        recipe: 'electron-pdf',
        electron: {
          marginsType: 1,
          format: 'A4',
        },
      },
      data: {
        test: style
      }
    }).then(function(resp) {
      //prints pdf with headline Hello world
      // console.log(resp.content.toString())
      fs.writeFileSync('jsreport-test.pdf', resp.content)
      res.download('jsreport-test.pdf')
      console.log("success")
    });
  }).catch(function(e) {
    console.log(e)
  })
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
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
var cors = require('cors')
var app = express()
const mysql = require('mysql');
var urlencoded = require('urlencode')
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors())
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'ittpdev'
});

con.connect((err) => {
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

app.post('/bot', (req, res, next) => {
  //cvar fetchData = QueryData()
  console.log('hit')
  console.log('req', req.body)
  var query = new Promise((resolve, reject) => {
      resolve(QueryData())
  })
  query.then( value => {
    console.log('value', value[0].id)
    sendText(res,value)
  })
  
  // sendText(res)
})

var fs = require('fs')
function sendText (res,value) {
  jsreport.init().then(function () {
    var buff = fs.readFileSync('src/index.html', 'utf8')
    var style = fs.readFileSync('src/style.css', 'utf8')
    var logoimg = "{#asset src/ittp.png @encoding=dataURI}"
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
        test: style,
        logo: logoimg,
        loanData: value[0].loan_id
      }
    }).then(function(resp) {
      //prints pdf with headline Hello world
      // console.log(resp.content.toString())
      fs.writeFileSync('jsreport-test.pdf', resp.content)
      res.download('jsreport-test.pdf')
      //res.sendStatus(200)
      console.log("success")
    });
  }).catch(function(e) {
    console.log(e)
  })
}

function QueryData() {
  var i = 0
  var resultData = {}
  return new Promise(function(resolve, reject){
    con.query('SELECT * FROM Transaction',
    function(err, results, fields) {
      resultData = results
      if(err)
        { console.log('Error while perfoming Query', err) }
      con.end()
      resultData = results
      // console.log('resultData', resultData)
      resolve(resultData)
    })
  })
}
app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
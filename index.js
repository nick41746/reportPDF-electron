var jsreport = require('jsreport-core')({
  "assets": {
    allowedFiles: '**/*.*',
    publickAccessEnabled: true,
    searchOnDiskIfNotFoundInStore: true,
  }
});
var express = require('express')
var mysql = require('mysql')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var Sequelize = require('sequelize')

const sequelize = new Sequelize('ittpdev', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Transaction = sequelize.define('Transaction')

Transaction.findAll().then(transactions => {
  console.log(transactions)
})

// sequelize.sync()
//   .then(() => {
//     Transaction.findAll({})
//       .then((data) => console.log(data))
//   }) 

app.set('port', (process.env.PORT || 4000))

app.get('/bot', (req, res) => {
  var result = QueryData()
  console.log('data', result)
  sendText(res,result)
})

var fs = require('fs')
function sendText(res,result) {
  console.log(result)
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
        dataTransaction: result
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

function QueryData() {
  var i = 0
  var resultData = {}
  connection.query('SELECT * FROM Transaction',
  function(err, results, fields) {
    resultData = results
    if(err)
      { console.log('Error while perfoming Query', err) }
    connection.end()
    resultData = results
    //console.log('resultData', resultData)
    return resultData
  })
  
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
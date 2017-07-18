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

var test = QueryData()
console.log('test',test)
app.set('port', (process.env.PORT || 4000))

app.get('/temp-receipt', (req, res) => {
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
      res.sendFile('jsreport-test.pdf' , { root : __dirname});
      console.log("success")
    });
  }).catch(function(e) {
    console.log(e)
  })
}


function QueryData(){
var resultTransaction = {}
var resultLoan = {}
var result = {}
var i = 0
const Transaction = sequelize.define('Transaction',{
  cash_in: {
    type: Sequelize.INTEGER,
  },
  loan_id: {
    type: Sequelize.STRING,
  },
  cfPrincipal: {
    type: Sequelize.INTEGER
  },
  cfInterest: {
    type: Sequelize.INTEGER
  },
  min_due: {
    type: Sequelize.INTEGER
  },
  cfFee: {
    type: Sequelize.INTEGER
  },
  trans_date: {
    type: Sequelize.DATE
  }
  },{
  timestamps: false,
  tableName: 'Transaction',
})

const Loan = sequelize.define('Loan',{
  loan_id: {
    type : Sequelize.STRING,
  },
  firstname: {
    type : Sequelize.STRING
  },
  lastname: {
    type : Sequelize.STRING
  }
  },{
  timestamps: false,
  tableName: 'Loan',
})

Transaction.findOne({where: {loan_id: 5910030559}
}).then(transactions => {
  resultTransaction = transactions.dataValues
  console.log('resultTransaction', resultTransaction)
})

Loan.findOne({where: {loan_id: 5910030559}
}).then(loans => {
  resultLoan = loans.dataValues
  console.log('resultLoan', resultLoan)
}).then( next => {
  result = Object.assign({}, resultTransaction, resultLoan)
  console.log('result', result)
}).then( next => {
  return result
})
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
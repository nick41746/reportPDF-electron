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
var moment = require('moment')
moment.locale('th')

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
  },
  citizen_id: {
    type: Sequelize.STRING
  }
  },{
  timestamps: false,
  tableName: 'Loan',
})

const Applications = sequelize.define('Applications',{
  citizenId: {
    type: Sequelize.STRING
  },
  title: {
    type : Sequelize.STRING,
  }
  },{
  timestamps: false,
  tableName: 'Applications',
})

app.set('port', (process.env.PORT || 4000))

app.get('/temp-receipt', (req, res) => {
  console.log('query', req.query)
  var resultTransaction = {}
  var resultLoan = {}
  var resultApplication = {}
  var result = {}
  Transaction.findOne({where: {id: req.query.id }})
    .then(transactions => {
      resultTransaction = transactions.dataValues
      console.log('resultTransaction', resultTransaction)
    })
    .then(() => {
      return Loan.findOne({where: {loan_id: resultTransaction.loan_id}})
    })
    .then(loans => {
      console.log('loans',loans)
      resultLoan = loans.dataValues
      console.log('resultLoan', resultLoan)
    })
    .then(() => {
      return Applications.findOne({where: {citizenId: resultLoan.citizen_id}})
    })
    .then(applicatons => {
      console.log('applicatons',applicatons)
      resultApplication = applicatons.dataValues
      console.log('resultLoan', resultApplication)
    })
    .then( () => {
      result = Object.assign({}, resultTransaction, resultLoan, resultApplication)
      console.log('result', result)
    })
    .then(() => sendText(res,result))
})

var fs = require('fs')
function sendText(res,result) {
  result.trans_date = moment(result.trans_date).add(543, 'years')
  result.trans_date = moment(result.trans_date).format("DD/MM/YYYY")
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
        },
      },
      data: {
        test: style,
        logo: logoimg,
        loanId: result.loan_id,
        firstName: result.firstname,
        lastName: result.lastname,
        cfPrincipal: result.cfPrincipal/10000,
        cfInterest: result.cfInterest/10000,
        minDue: result.min_due/10000,
        cfFee: result.cfFee/10000,
        transDate: result.trans_date,
        title: result.title
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

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
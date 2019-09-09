const mongodb = require('mongodb')
const budgetsService = require('./budgets')

function MongoDao(mongoUri, dbname) {
    var _this = this;
    var options = {
        useNewUrlParser: true
    }
    _this.mongoClient = new mongodb.MongoClient(mongoUri, options)
    return new Promise(function(resolve, reject) {
        _this.mongoClient.connect(function(err, client) {
            console.log("mongo client successfully connected \n")
            _this.dbConnection = _this.mongoClient.db(dbname)
            resolve(_this)
        })
    })
}
async function main() {
    const mongoDao = await new MongoDao('mongodb://localhost:27017', 'orcadmin')
    const budgets = mongoDao.dbConnection.collection('budgets')
    //await fillBudget(budgets)
    await sendReport(budgets, new Date('2019-05-15'), new Date('2019-05-23'))
}

main();

async function fillBudget (db) {
    //db.drop();
    const listemails = [];

    var filter = []
    for (var e = 0; e < listemails.length; e++) {
        var doc = listemails[e]
        if (filter.indexOf(doc.budgetEmail) >= 0) {
            continue
        } 
        filter.push(doc.budgetEmail)     
        db.insertOne(doc, function(err, res) {
            if (err) throw err
            console.log(res.insertedId)         
        });
    }
}

async function sendReport (db, begin, end) {   
    let query = {dateCreated: { $gt: begin, $lt: end}}
    db.find(query).toArray(function(err, result) {
        if (err) throw err
        for (let u = 0; u < result.length; u++) {
            console.log(`send budget (since ${begin} to ${end}) / ${result[u].budgetEmail} - ${result[u].dateCreated}`)
        }
        budgetsService.sendEmailOndemand(result)
    })  
}

async function createTransport() {
    return nodemailer.createTransport({
      host: 'smtp-pt.securemail.pro',
      //port: emailsafecleanpt.port,
      //secure: emailsafecleanpt.secure, // true for 465, false for other ports
      port: 465,
      secure: true,
      auth: {
        user: emailsafecleanpt.user, // generated ethereal user
        pass: emailsafecleanpt.pass // generated ethereal password
      }
    })
}

async function alternativeSendemail () {

    const nodemailer = require('nodemailer')
    const emailsafecleanpt = require('/opt/orccontext')['email_safeclean_pt']

    let message = {
        to: 'geral@safeclean.pt',
        subject: 'teste local',
        html: 'teste local'
    };

    let transporter = await createTransport().then(function(tporter){
        if (tporter) {
          message.from = emailsafecleanpt.user
          return tporter.sendMail(message).then(function (info) {
            var log = `Message sent: ${info.messageId} - `
            log += `Preview URL: ${nodemailer.getTestMessageUrl(info)}`
            console.log(log)
            return log
          }).catch(function (error) {
            let maillogerror = '*** email error logger ***\n'       
            maillogerror += error
            maillogerror += '\n'
            maillogerror += 'message= ' + JSON.stringify(message)
            console.log(maillogerror)
            return error
          })
        } else {
          return  console.log('nada a fazer')
        }   
    }).catch(function (err) {
        console.log(err)
        return err
    })
}

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const config = require('./config/config')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('./passport')
const app = express()
app.use(passport.initialize())
mongoose.connect('mongodb://localhost:27017/orcadmin')//, {useMongoClient: true}
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.use(session({
  secret: 'access_token',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 3600, secure: false}
}))

require('./routes')(app)

app.listen(config.port)

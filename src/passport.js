
const passport = require('passport')
const User = require('./models/User')
const PassportJWT = require('passport-jwt')
const JwtStrategy = PassportJWT.Strategy
const ExtractJwt = PassportJWT.ExtractJwt

const config = require('./config/config')
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.authentication.jwtSecret
}

async function strategyCallback (jwtPayload, done) {
  try {
    await User.findOne({'_id': jwtPayload._id}, (err, user) => {
      if (err) {
        done(new Error(err), false)
      }
      if (!user) {
        console.log('JwtStrategy Error: no user')
        done(new Error('JWT error user not exist'), false)
      }
      done(null, user)
    })
  } catch (error) {
    return done(new Error(error), false)
  }
}

const strategy = new JwtStrategy(options, strategyCallback)

passport.use(strategy)

module.exports = passport

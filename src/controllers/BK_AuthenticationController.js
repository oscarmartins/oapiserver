const {User} = require('../models')
const jwt = require('jsonwebtoken')
const config = require('../config/config')

function jwtSignUser (user) {
  return jwt.sign(user, config.authentication.jwtSecret, {
    expiresIn: 60
  })
}

module.exports = {
  async register (req, res) {
    try {
      const user = User.create(req.body)
      const usrJson = user.toJSON()
      return res.send({
        user: usrJson,
        token: jwtSignUser(usrJson)
      })
    } catch (err) {
      return res.status(400).send({
        error: 'This email account is already in use'
      })
    }
  },
  async login (req, res) {
    try {
      const {email, password} = req.body
      const user = await User.findOne({
        where: {
          email: email
        }
      })
      if (!user) {
        return res.status(403).send({
          error: 'The login info was incorrect [findOne]'
        })
      }
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(403).send({
          error: 'The login info was incorrect [password]'
        })
      }
      const usrJson = user.toJSON()
      res.send({
        user: usrJson,
        token: jwtSignUser(usrJson)
      })
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured trying to login'
      })
    }
  }
}

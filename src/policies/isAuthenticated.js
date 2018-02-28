const passport = require('passport')

module.exports = function (req, res, next) {
  passport.authenticate('jwt', {session: false}, function (err, user) {
    if (err || !user) {
      res.status(403).send({
        error: 'you do not habe access to this resource'
      })
    } else {
      req.user = user
      return next()
    }
  })(req, res, next)
}

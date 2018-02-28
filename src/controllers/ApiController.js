const apiPolicy = require('../policies/ApiPolicy')
module.exports = {
  fetchApiPolicy: (req, res) => {
    res.status(200).send(apiPolicy)
  }
}

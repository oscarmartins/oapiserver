const apiPolicy = require('../policies/ApiPolicy')
module.exports = {
  fetchApiPolicyLocal: apiPolicy,
  fetchApiPolicy: (req, res) => {
    res.status(200).send(apiPolicy)
  }
}

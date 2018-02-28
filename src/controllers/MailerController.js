const knex = require('../config/knex')
const mailer = require('../models/mailer').schema()
module.exports = {
  async fetchProfiles (req, res) {
    try {
      await knex('mailer').select('*').then((result) => {
        return res.send({'fetchProfiles': result})
      })
    } catch (err) {
      console.log('fetchProfiles error', err)
      return res.status(400).send({
        error: err,
        'fetchProfiles': 'error'
      })
    }
  },
  async retrieveProfileById (req, res) {
    try {
      const { profileid } = req.params
      let error = null
      if (!profileid || profileid.length === 0) {
        error = 'field profileid is requerid.'
      }
      if (error) {
        return res.send({error: error})
      }
      await knex('mailer').where('id', profileid).first()
        .then(function (profile) {
          return res.send({'success': true, profile: profile})
        }).catch(function (err) {
          if (err) {
            console.log(err)
          }
          return res.send({'error': err})
        })
    } catch (e) {
      return res.status(400).send({error: e.message})
    }
  },
  async new (req, res) {
    try {
      const { name, host, port, secure, user, pass, description } = req.body
      let error = null
      if (!name || name.length === 0) {
        error = 'field name is requerid.'
      } else if (!host || host.length === 0) {
        error = 'field host is requerid.'
      } else if (!port) {
        error = 'field port is requerid.'
      } else if (!user || user.length === 0) {
        error = 'field user is requerid.'
      } else if (!pass || pass.length === 0) {
        error = 'field pass is requerid.'
      } else if (secure && description) {
        console.log('ok')
      }
      if (error) {
        return res.send({error: {detail: error}})
      }
      mailer.name = name
      mailer.port = port
      mailer.host = host
      mailer.user = user
      mailer.pass = pass
      mailer.secure = secure
      mailer.date = new Date()
      mailer.description = description
      console.log(mailer)
      await knex('mailer').insert(mailer, 'id')
        .then(function () {
          return res.send({'success': '1'})
        })
        .catch(function (err) {
          if (err) {
            console.log(err)
          }
          return res.send({'error': err})
        })
    } catch (e) {
      console.log(e)
      return res.status(400).send({error: e.message})
    }
  },
  async update (req, res) {
    try {
      console.log('update')
      const { profileid, name, host, port, secure, user, pass, description } = req.body
      let error = null
      if (!name || name.length === 0) {
        error = 'field name is requerid.'
      } else if (!host || host.length === 0) {
        error = 'field host is requerid.'
      } else if (!port) {
        error = 'field port is requerid.'
      } else if (!user || user.length === 0) {
        error = 'field user is requerid.'
      } else if (!pass || pass.length === 0) {
        error = 'field pass is requerid.'
      } else if (secure && description) {
        console.log('ok')
      }
      if (error) {
        return res.send({error: error})
      }
      mailer.name = name
      mailer.port = port
      mailer.host = host
      mailer.user = user
      mailer.pass = pass
      mailer.secure = secure
      mailer.date = new Date()
      mailer.description = description
      console.log(profileid)
      await knex('mailer').where('id', profileid).update(mailer)
        .then(function (result) {
          return res.send({'success': '1'})
        })
        .catch(function (err) {
          if (err) {
            console.log('not updated!!!.. ', err)
          }
          return res.send({'error': err})
        })
    } catch (e) {
      return res.status(400).send({error: e.message})
    }
  },
  async remove (req, res) {
    try {
      console.log('=== remove ====')
      const { profileid } = req.params
      console.log(profileid)
      let error = null
      if (!profileid || profileid.length === 0) {
        error = 'field profileid is requerid.'
      }
      if (error) {
        return res.send({error: error})
      }
      await knex('mailer').where('id', profileid).del()
        .then(function (result) {
          return res.send({'success': '1'})
        })
        .catch(function (err) {
          if (err) {
            console.log('not updated!!!.. ', err)
          }
          return res.send({'error': err})
        })
    } catch (e) {
      return res.status(400).send({error: e.message})
    }
  }
}

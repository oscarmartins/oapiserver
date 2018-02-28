const environment = process.env.NODE_ENV || 'development'
const config = require('/opt/orccontext')['pg_database'][environment]
const knex = require('knex')
module.exports = knex(config)

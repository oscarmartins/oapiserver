const fs = require('fs')
const path = require('path')
const dbs = {}
const sequelizeFilter = ['mailer.js', 'Users.js', 'Song.js', 'sequelize_index.js', 'History.js', 'Bookmark.js']
fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (sequelizeFilter.indexOf(file) < 0))
  .forEach((file) => {
    if (file.slice(-3) !== '.js') return
    const model = file.replace('.js', '')
    dbs[model] = require(path.join(__dirname, file))
  })

module.exports = dbs

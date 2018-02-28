module.exports = {
  schema: function () {
    return {
      name: '',
      host: '',
      port: 0,
      description: '',
      secure: false,
      date: '',
      user: '',
      pass: ''
    }
  },
  _make: function (knex) {
    try {
      knex.schema.createTable('mailer', (table) => {
        console.log(table)
        table.increments()
        table.text('name').notNullable().unique()
        table.text('host').notNullable()
        table.integer('port').notNullable()
        table.text('description')
        table.boolean('secure').defaultTo(false).notNullable()
        table.datetime('date').notNullable()
        table.text('user').notNullable()
        table.text('pass').notNullable()
      }).then((err, result) => {
        if (err) {
          console.log('error', err)
        } else {
          console.log('iook', result)
        }
      })
    } catch (error) {
      console.log(error)
    }
  },
  _drop: function (knex) {
    knex.schema.dropTable('mailer').then(() => {
      console.log('drop table: mailer ')
    })
  },
  alterTable: function (knex) {
    this._drop(knex)
    this._make(knex)
  }
}

const AccountController = require('./controllers/AccountController')
const SongsController = require('./controllers/SongsController')
const BookmarksController = require('./controllers/BookmarksController')
const HistoriesController = require('./controllers/HistoriesController')
const isAuthenticated = require('./policies/isAuthenticated')
const MailerController = require('./controllers/MailerController')
const ApiController = require('./controllers/ApiController')

module.exports = (app) => {
  app.post('/register', AccountController.execute)
  app.post('/login', AccountController.execute)
  app.post('/logout', AccountController.execute)
  app.post('/passwordRecovery', AccountController.execute)

  app.post('/services', AccountController.execute)
  app.get('/services', AccountController.execute)

  app.get('/api/fetchApiPolicy', ApiController.fetchApiPolicy)

  app.get('/emailer', isAuthenticated, MailerController.fetchProfiles)
  app.get('/emailer/:profileid', isAuthenticated, MailerController.retrieveProfileById)
  app.post('/emailer', isAuthenticated, MailerController.new)
  app.put('/emailer', isAuthenticated, MailerController.update)
  app.delete('/emailer/:profileid', isAuthenticated, MailerController.remove)

  app.get('/songs', SongsController.index)
  app.get('/songs/:songId', SongsController.show)
  app.put('/songs/:songId', SongsController.put)
  app.post('/songs', SongsController.post)

  app.get('/bookmarks', isAuthenticated, BookmarksController.index)
  app.post('/bookmarks', isAuthenticated, BookmarksController.post)
  app.delete('/bookmarks/:bookmarkId', isAuthenticated, BookmarksController.remove)

  app.get('/histories', isAuthenticated, HistoriesController.index)
  app.post('/histories', isAuthenticated, HistoriesController.post)
}

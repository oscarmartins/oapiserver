const AccountController = require('./controllers/AccountController')
const SongsController = require('./controllers/SongsController')
const BookmarksController = require('./controllers/BookmarksController')
const HistoriesController = require('./controllers/HistoriesController')
const isAuthenticated = require('./policies/isAuthenticated')
const MailerController = require('./controllers/MailerController')
const ApiController = require('./controllers/ApiController')
const ApiEndpoint = require('./controllers/endpoint')
const SysAccountController = require('./controllers/SysAccountController')

module.exports = (app) => {

  /** SysApp Routes @begin **/

  app.post('/sign-up', SysAccountController.execute)
  app.post('/sign-in', SysAccountController.execute)
  app.post('/account-verification', SysAccountController.execute)
  app.post('/auto-seed-aux-models', SysAccountController.execute)

  /** SysApp Routes @end **/

  app.post('/register', AccountController.execute)
  app.post('/login', AccountController.execute)
  app.post('/logout', AccountController.execute)
  app.post('/passwordRecovery', AccountController.execute)

  app.post('/services', AccountController.execute)
  app.get('/services', AccountController.execute)

  app.post('/orcv2', ApiEndpoint.execute)
  app.get('/orcv2', ApiEndpoint.execute)

  app.get('/orcv2/fetchApiPolicy', ApiController.fetchApiPolicy)
  app.get('/orcv2/viewController', async (req, res, next) => {
    try {
      const user = await ApiEndpoint.execute(req, res, next)
    } catch (e) {
      //this will eventually be handled by your error handling middleware
      next(e) 
    }
  })

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

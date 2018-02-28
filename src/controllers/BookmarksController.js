const {
  Bookmark,
  Song
} = require('../models')
const _ = require('lodash')
module.exports = {
  async index (req, res) {
    try {
      const userId = req.user.id
      const {songId} = req.query
      const where = {
        UserId: userId
      }
      if (songId) {
        where.SongId = songId
      }
      const bookmarks = await Bookmark.findAll({
        where: where,
        include: [{
          model: Song
        }]
      })
        .map(bookmark => bookmark.toJSON())
        .map(bookmark => _.extend(
          {},
          bookmark.Song,
          bookmark))

      res.send(bookmarks)
    } catch (error) {
      res.status(500).send({
        error: 'An error has ocurred trying to fetch the bookmarks.'
      })
    }
  },
  async post (req, res) {
    try {
      const userId = req.user.id
      const {songId} = req.body
      const bookmark = await Bookmark.findOne({
        where: {
          SongId: songId,
          UserId: userId
        }
      })
      if (bookmark) {
        return res.status(400).send({
          error: 'You already have this set as a bookmark.'
        })
      }
      const newBookmark = await Bookmark.create({
        SongId: songId,
        UserId: userId
      })
      res.send(newBookmark)
    } catch (error) {
      res.status(500).send({
        error: 'An error has ocurred trying to create the bookmark.'
      })
    }
  },
  async remove (req, res) {
    try {
      const userId = req.user.id
      console.log('remove bookmark')
      const {bookmarkId} = req.params
      const bookmark = await Bookmark.findOne({
        where: {
          id: bookmarkId,
          UserId: userId
        }})
      if (!bookmark) {
        return res.status(403).send({
          error: 'You do not have access to this bookmark.'
        })
      }
      await bookmark.destroy()
      res.send(bookmark)
    } catch (error) {
      res.status(500).send({
        error: 'An error has ocurred trying to remove the bookmark.'
      })
    }
  }
}

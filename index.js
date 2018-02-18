const express = require('express')
const bodyParser = require('body-parser')
const store = require('./store')
const db = require('./db')


async function run() {
  await db.sync()
  const app = express()
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())
  const port = process.env.PORT || 3000

  app.get('/showtimes', async (req, res) => {
    const movies = await store.getShowtimes()
    res.json(movies)
  })

  app.get('/coming_soon', async (req, res) => {
    const movies = await store.getComingSoon()
    res.json(movies)
  })

  app.post('/device', async (req, res) => {
    let status = 400
    try {
      const {deviceId, apnsToken} = req.body
      if (deviceId, apnsToken) {
        await db.updateDevice(deviceId, apnsToken)
        status = 200
      }
    } catch(e) {
      status = 400
    } finally {
      res.sendStatus(status)
    }
  })

  app.post('/notify', async (req, res) => {
    let status = 400
    try {
      const {deviceId, imdbId} = req.body
      if (deviceId && imdbId) {
        await db.createNotification(deviceId, imdbId)
        status = 200
      }
    } catch(e) {
      status = 400
    } finally {
      res.sendStatus(status)
    }
  })

  app.delete('/notify', async (req, res) => {
    try {
      const {deviceId, imdbId} = req.body
      if (deviceId && imdbId) {
        await db.deleteNotification(deviceId, imdbId)
        status = 200
      }
    } catch(e) {
      status = 400
    } finally {
      res.sendStatus(status)
    }
  })

app.listen(port, () => console.log(`Server listening on port ${port}`))
}

run()

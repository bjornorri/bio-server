const express = require('express')
const store = require('./store')


const app = express()
const port = process.env.PORT || 3000

app.get('/showtimes', async (req, res) => {
  const movies = await store.getShowtimes()
  res.json(movies)
})

app.get('/coming_soon', async (req, res) => {
  const movies = await store.getComingSoon()
  res.json(movies)
})

app.listen(port, () => console.log(`Server listening on port ${port}`))

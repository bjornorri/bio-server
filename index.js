const express = require('express')
const API = require('./api')


const app = express()
const port = process.env.PORT || 3000

app.get('/showtimes', async (req, res) => {
  const data = await API.getShowtimes()
  res.json(data)
})

app.get('/coming_soon', async (req, res) => {
  const data = await API.getComingSoon()
  res.json(data)
})

app.listen(port, () => console.log(`Server listening on port ${port}`))

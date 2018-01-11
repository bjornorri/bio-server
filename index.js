const express = require('express')
const store = require('./store')


const app = express()
const port = process.env.PORT || 3000

app.get('/showtimes', async (req, res) => {
  res.json(store.showtimes)
})

app.get('/coming_soon', async (req, res) => {
  res.json(store.comingSoon)
})

app.listen(port, () => console.log(`Server listening on port ${port}`))

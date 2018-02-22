const API = require('./api')
const db = require('./db')
const push = require('./push')
const middleware = require('./middleware')


class Store {

  constructor() {
    this.showtimes = null
    this.upcoming = null
    this.fetchData()
    setInterval(() => this.fetchData(), 1000 * 60 * 30);
  }

  async fetchData() {
    const [stData, csData] = await (Promise.all([API.getShowtimes(), API.getComingSoon()]));
    const [showtimes, upcoming] = await (Promise.all([middleware.processShowtimes(stData), middleware.processComingSoon(csData)]))
    this.showtimes = showtimes
    this.upcoming = upcoming
    push.sendNotifications(showtimes)
  }

  async getShowtimes(deviceId = null) {
    if (this.showtimes === null) {
      await this.fetchData()
    }
    return this.showtimes
  }

  async getUpcoming(deviceId = null) {
    if (this.upcoming === null) {
      await this.fetchData()
    }
    let movies = this.upcoming
    if (deviceId) {
      movies = await this.addNotifications(movies, deviceId)
    }
    return movies
  }

  async addNotifications(movies, deviceId) {
    const notifications = await db.notificationsForDevice(deviceId)
    const imdbIds = new Set(notifications.map(n => n.imdbId))
    movies.forEach(m => {
      const exists = imdbIds.has(m.imdb_id)
      m.notify = exists
    })
    return movies
  }
}

module.exports = new Store()


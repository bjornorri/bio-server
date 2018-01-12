const API = require('./api')
const middleware = require('./middleware')


class Store {

  constructor() {
    this.showtimes = null
    this.comingSoon = null
    this.fetchData()
    setInterval(() => this.fetchData(), 1000 * 60 * 30);
  }

  async fetchData() {
    const [stData, csData] = await (Promise.all([API.getShowtimes(), API.getComingSoon()]));
    const [showtimes, comingSoon] = await (Promise.all([middleware.processShowtimes(stData), middleware.processComingSoon(csData)]))
    this.showtimes = showtimes
    this.comingSoon = comingSoon
  }

  async getShowtimes() {
    if (this.showtimes === null) {
      await this.fetchData()
    }
    return this.showtimes
  }

  async getComingSoon() {
    if (this.comingSoon === null) {
      await this.fetchData()
    }
    return this.comingSoon
  }
}

module.exports = new Store()


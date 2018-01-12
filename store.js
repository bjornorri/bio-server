const API = require('./api')
const middleware = require('./middleware')


class Store {

  constructor() {
    this._showtimes = null
    this._comingSoon = null
    this.fetchData()
    setInterval(() => this.fetchData(), 1000 * 60 * 30);
  }

  async fetchData() {
    const [stData, csData] = await (Promise.all([API.getShowtimes(), API.getComingSoon()]));
    const [showtimes, comingSoon] = await (Promise.all([middleware.processShowtimes(stData), middleware.processComingSoon(csData)]))
    this._showtimes = showtimes
    this._comingSoon = comingSoon
  }

  get showtimes() {
    return this._showtimes
  }

  get comingSoon() {
    return this._comingSoon
  }
}

module.exports = new Store()


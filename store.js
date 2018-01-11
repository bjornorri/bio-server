const API = require('./api')


class Store {

  constructor() {
    this._showtimes = null
    this._comingSoon = null
    this.fetchData()
    setInterval(() => this.fetchData(), 1000 * 60 * 30);
  }

  async fetchData() {
    const [showtimes, comingSoon] = await (Promise.all([API.getShowtimes(), API.getComingSoon()]));
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


const axios = require('axios')


class API {

  constructor() {
    this.token = null
  }

  async authenticate() {
    const url = 'http://api.kvikmyndir.is/authenticate'
    const data = {
      username: process.env.KVIKMYNDIR_USERNAME,
      password: process.env.KVIKMYNDIR_PASSWORD,
    }
    const res = await axios.post(url, data)
    return res.data.success ? res.data.token : null
  }

  async request(url) {
    const res = await axios.get(url, {headers: {'x-access-token': this.token}})
    if (res.data.success === false) {
      this.token = await this.authenticate()
      return this.request(url)
    }
    return res
  }
}

module.exports = new API()


const apn = require('apn')
const db = require('./db')


class Push {

  constructor() {
    const options = {
      token: {
        key: process.env.APNS_KEY,
        keyId: "N4YAN3AJ73",
        teamId: "5762VEA4LK"
      },
      production: false
    }
    this.apnProvider = new apn.Provider(options);
  }

  async sendNotifications(movies) {
    movies.forEach(m => this.sendNotificationForMovie(m))
  }

  async sendNotificationForMovie(movie) {
    const tokens = await db.notificationTokensForMovie(movie.imdb_id)
    if (tokens.length === 0) { return }
    const notification = new apn.Notification({
      alert: {
        title: movie.title,
        body: "Er komin í bíó"
      },
      sound: "chime.caf",
      badge: 1,
      topic: "com.bjornorri.bio"
    })
    this.apnProvider.send(notification, tokens).then(res => {
      const successTokens = res.sent.map(info => info.device)
      db.deleteSentNotifications(movie.imdb_id, tokens)
    })
  }

}

module.exports = new Push()


const apn = require('apn')
const db = require('./db')


class Push {

  constructor() {
    const options = {
      token: {
        key: process.env.APNS_KEY,
        keyId: "N4YAN3AJ73",
        teamId: "5762VEA4LK"
      }
    }
    this.apnProvider = new apn.Provider(options);
  }

  async sendNotifications(movies) {
    movies.forEach(m => this.sendNotificationForMovie(m))
  }

  async sendNotificationForMovie(movie) {
    const tokens = await db.notificationTokensForMovie(movie.imdb_id)
    if (tokens.length === 0) { return }
    if (movie.premature) { return  } // TODO: Handle notifications for premature movies.
    const message = movie.premature ? "Er forsýnd í dag" : "Er komin í bíó"
    const notification = new apn.Notification({
      alert: {
        title: movie.title,
        body: message
      },
      payload: {
        link: `bio://showtimes/${movie.imdb_id}`
      },
      sound: "chime.caf",
      badge: 1,
      topic: "com.bjornorri.bio"
    })
    this.apnProvider.send(notification, tokens).then(res => {
      if (!movie.premature) {
        const successTokens = res.sent.map(info => info.device)
        db.deleteSentNotifications(movie.imdb_id, tokens)
      }
    })
  }

}

module.exports = new Push()


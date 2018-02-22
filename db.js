const { Client, Pool } = require('pg')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const Device = sequelize.define('device', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  apnsToken: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  }
})

const Notification = sequelize.define('notification', {
  imdbId: {
    type: Sequelize.STRING
  }
})
Notification.belongsTo(Device)


class DataBase {

  constructor() {
    this.sequelize = sequelize
  }

  async sync() {
    await this.sequelize.sync()
  }

  async updateDevice(deviceId, apnsToken) {
    const [device, created] = await Device.findOrCreate({
      where: {id: deviceId},
      defaults: {apnsToken: apnsToken}
    })
    if (!created) {
      await device.update({apnsToken: apnsToken})
    }
  }

  async createNotification(deviceId, imdbId) {
    const device = await Device.findOrCreate({
      where: {id: deviceId}
    })
    const notification = await Notification.findOrCreate({
      where: {imdbId: imdbId, deviceId: deviceId}
    })
    return notification
  }

  async deleteNotification(deviceId, imdbId) {
    await Notification.destroy({where: {imdbId, deviceId}})
  }

  async notificationsForDevice(deviceId) {
    const notifications = await Notification.findAll({
      where: {deviceId: deviceId}
    })
    return notifications
  }

  async notificationTokensForMovie(imdbId) {
    const notifications = await Notification.findAll({
      where: {imdbId: imdbId},
      include: [Device]
    })
    const devices = notifications.map(n => n.device)
    const tokens = devices.map(d => d.apnsToken).filter(t => t !== null)
    return tokens
  }

  async deleteSentNotifications(imdbId, tokens) {
    const tokenSet = new Set(tokens)
    const notifications = await Notification.findAll({
      where: {imdbId: imdbId},
      include: [Device]
    })
    notifications.forEach(n => {
      if (tokenSet.has(n.device.apnsToken)) {
        n.destroy()
      }
    })
  }

  disconnect() {
    this.sequelize.close()
  }
}

module.exports = new DataBase()


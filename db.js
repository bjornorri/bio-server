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

  disconnect() {
    this.sequelize.close()
  }
}

module.exports = new DataBase()


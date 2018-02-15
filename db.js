const { Client, Pool } = require('pg')
const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const Device = sequelize.define('device', {
  uuid: {
    type: Sequelize.UUID,
    unique: true
  },
  apnsToken: {
    type: Sequelize.STRING,
    unique: true
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
    const device = await Device.findOrCreate({
      where: {uuid: deviceId},
      defaults: {apnsToken: apnsToken}
    }).spread((device, created) => {
      if (!created) {
        device.update({apnsToken: apnsToken})
      }
      return device
    })
    return device
  }

  disconnect() {
    this.sequelize.close()
  }
}

module.exports = new DataBase()


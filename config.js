const homebridgeConfig = require("../../homebridge.json");

module.exports = {
  homebridge: {
    url: process.env.HOMEBRIDGE_URL || homebridgeConfig.url
  },
  garage: {
    relay: {
      pin: 4
    },
    readSensor: {
      closed: {
        pin: 18
      },
      open: {
        pin: 24
      }
    }
  }
};
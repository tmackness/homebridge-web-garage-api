const Gpio = require("onoff").Gpio;
const config = require("../../config");
const { timeout } = require("../helpers/index");
const { garageStatus } = require("./status");
const storage = require("node-persist");
const axios = require("axios");

const doorRelayAction = async () => { 
  try {
    // https://pinout.xyz/
    // Pin 26 (Raspberry Pi Pin number) = BCM pin 7.
    const doorRelay = new Gpio(config.garage.relay.pin, 'low');
    await doorRelay.write(1);    
    await timeout(2000);
    await doorRelay.write(0);
    await doorRelay.unexport();
  } catch (error) {
    throw error;
  }
};

module.exports = async (targetDoorState) => {
  try {
    // check status of door
    const status = await garageStatus();
    
    if (status.currentDoorState == 1) {
      // check to make sure garage isn't already open
      if (targetDoorState == 0) {
        // open garage
        await doorRelayAction();
        // update currentDoorState status state and notify homebrdige
        await storage.setItem("currentDoorState", "opening");
        await storage.setItem("targetDoorState", "open");
        await axios.get(`${config.homebridge.url}/currentDoorState/2`);

        return true;
      } else {
        console.log("Garage door is already closing or is closed.");
        return false;
      }
    } else if (status.currentDoorState == 0) {
      // check to make sure garage isn't already closed
      if (targetDoorState == 1) {
        // close garage
        await doorRelayAction();
        // update currentDoorState status
        await storage.setItem("currentDoorState", "closing");
        await storage.setItem("targetDoorState", "closed");
        await axios.get(`${config.homebridge.url}/currentDoorState/3`);
        return true;
      } else {
        console.log("Garage door is already opening or is open.");
        return false;
      }
    } else {
      // Garage door is already opening / closing
      throw new Error(`Garage door is already opening or closing.`);
    }
  } catch (error) {
    throw error;
  }
}
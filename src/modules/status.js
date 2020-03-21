const Gpio = require("onoff").Gpio;
const config = require("../../config");
const { timeout } = require("../helpers/index");
const storage = require("node-persist");
const axios = require('axios');

// Our reed switches are wired in a pull up state. Therefore there state is 1. So if no contact with the magnet it will be 1 else 0.

const doorState = async () => {
  try {
    const readSensorClosed = new Gpio(config.garage.readSensor.closed.pin, "in");
    const readSensorOpen = new Gpio(config.garage.readSensor.open.pin, "in");
    const isClosed = await readSensorClosed.read() == 0 ? true : false;
    const isOpen = await readSensorOpen.read() == 0 ? true : false;
    const targetDoorState = await storage.getItem("targetDoorState");
    
    // to do - run loop to make sure door state has remain constant for ~1 second as it could return closed when in fact its was opening but still in contact with closed reed switch
    if (isClosed && !isOpen) {
      await storage.removeItem("currentDoorState");
      if (targetDoorState === "closed") await storage.removeItem("targetDoorState");
      await axios.get(`${config.homebridge.url}/currentDoorState/1`);
      return "closed"
    } else if (!isClosed && isOpen) {
      await storage.removeItem("currentDoorState");
      if (targetDoorState === "open") await storage.removeItem("targetDoorState");
      await axios.get(`${config.homebridge.url}/currentDoorState/0`);
      return "open"
    } else if (!isClosed && !isOpen) {
      const state = await storage.getItem("currentDoorState");
      return state;
    } else {
      // todo handle obstructions
      // await axios.get(`${config.homebridge.url}/obstructionDetected/1`);
      throw new Error("Incorrect reed states. Both reeds cannot be true.")
    }
  } catch (error) {
    throw error;
  }
};

const garageStatus = async () => {
  try {
    const getCurrentDoorState = await doorState();
    const getTargetDoorState = await storage.getItem("targetDoorState");
    
    const currentDoorState = (
      getCurrentDoorState === "open"
        ? 0
        : getCurrentDoorState === "closed"
          ? 1
          : getCurrentDoorState === "opening"
            ? 2
            : getCurrentDoorState === "closing"
              ? 3
              : null
    );
    
    // if not targetDoorState then return the currentDoorState (replacing opening / closing with end result e.g 0 / 1);
    const targetDoorState = (
      getTargetDoorState === "open"
        ? 0
        : getTargetDoorState === "closed"
          ? 1
          : getCurrentDoorState === "open" || getCurrentDoorState === "opening"
            ? 0
            : getCurrentDoorState === "closed" || getCurrentDoorState === "closing"
              ? 1
              : null
    );
    
    if (currentDoorState === null) {
      throw new Error(
        "Unknown door state. Door is not fully open nor fully closed. `currentDoorState` can not be null. Check reed switches or system is run with garage door not in a recognised state closed/open."
      );
    }

    return {
      currentDoorState,
      targetDoorState
    };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  doorState,
  garageStatus
};
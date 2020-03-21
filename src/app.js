const express = require("express");
const doorOperation = require("./modules/doorOperation");
const { garageStatus } = require("./modules/status");
const storage = require("node-persist");

const app = express();
const port = 3000;

// database
(async () => {
  await storage.init();
})();

// Middleware
app.use(async (req, res, next) => {
  next();
});

// state 0 = open, 1 = close, 2 = opening, 3 = closing

app.get("/status", async (req, res) => {
  try {
    const status = await garageStatus();
    console.log(status);
    res.json(status);
  } catch (error) {
    console.log(error);
    res.json({ request: "error", message: error.message });
  }
});

// Open and Close Door
// accepts 0 opens, 1 closes.
app.get("/setTargetDoorState/:state", async (req, res) => {
  try {    
    const run = await doorOperation(req.params.state);
    const runStatus = run == true ? "success" : "error";

    res.json({request: runStatus})

  } catch (error) {
    console.log(error);
    res.json({ request: "error", message: error.message });
  }  
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({request: "error", error: err });
});
  
app.listen(port, () => winston.info(`App listening on port ${port}!`));
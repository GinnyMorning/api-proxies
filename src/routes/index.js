const express = require("express");
// const newRoute = require("./new.route");
const cryptoRoute = require("./crypto.route");

const routes = express.Router();

routes.use("/crypto", cryptoRoute);
// routes.use("/news", newRoute);

module.exports = routes;

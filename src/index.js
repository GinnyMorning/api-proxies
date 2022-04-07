const express = require("express");
const morgan = require("morgan");
const xss = require("xss-clean");
const helmet = require("helmet");

require("dotenv").config();
const routes = require("./routes");

const { createProxyMiddleware } = require("http-proxy-middleware");

// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT;

// Logging
app.use(morgan("dev"));

// set sercurity HTTP header
app.use(helmet());

// sanitize request data
app.use(xss());

app.use(
  "/json_placeholder",
  createProxyMiddleware({
    target: "https://api.coinranking.com/v2",
    changeOrigin: true,
    pathRewrite: {
      [`^/json_placeholder`]: "/coins",
    },
  })
);

app.use("/v1", routes);

// Start the Proxy
const server = app.listen(PORT, () => {
  console.log(`Starting Proxy at ${PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log("Close server");
      //   logger.warn("Close server");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// eslint-disable-next-line no-unused-vars
const unexpectedErrorHandler = (err) => {
  console.log(err);
  //   logger.error(err);
  exitHandler();
};
process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  if (server) {
    console.log("close server due to sig kill");
    // logger.warn("close server due to sig kill");
    server.close();
  }
});

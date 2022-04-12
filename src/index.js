const express = require("express");
const morgan = require("morgan");
const xss = require("xss-clean");
const helmet = require("helmet");
const compression = require("compression");
var cors = require("cors");

const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const routes = require("./routes");
const cache = require("./utility/routeCache");

const { createProxyMiddleware } = require("http-proxy-middleware");
const API_CRYPTO_SERVICE_URL = process.env.API_CRYPTO_URL;
const API_CRYPTO_SERVICE_KEY = process.env.API_CRYPTO_KEY;
const API_NEWS_SERVICE_URL = process.env.API_NEWS_URL;
const API_NEWS_SERVICE_KEY = process.env.API_NEWS_KEY;

const CORS = process.env.CORS_URL;
// Create Express Server
const app = express();

// Configuration
const PORT = process.env.PORT;

//Compression
app.use(compression());

// Logging
app.use(morgan("dev"));

// set sercurity HTTP header
app.use(helmet());

// sanitize request data
app.use(xss());

//setting CROS
var corsOptions = {
  origin: CORS,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(
  "/getcoins",
  cors(corsOptions),
  createProxyMiddleware({
    target: API_CRYPTO_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/getcoins`]: "/coins",
    },
    headers: {
      "x-access-token": API_CRYPTO_SERVICE_KEY,
    },
  })
);

app.use(
  "/getnews",
  cors(corsOptions),
  createProxyMiddleware({
    target: API_NEWS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/getnews`]: "/news",
    },
    headers: {
      "x-bingapis-sdk": "true",
      "x-rapidapi-host": "bing-news-search1.p.rapidapi.com",
      "x-rapidapi-key": API_NEWS_SERVICE_KEY,
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

const express = require("express");
const router = express.Router();
const { createProxyMiddleware } = require("http-proxy-middleware");

const API_SERVICE_URL = process.env.API_CRYPTO_URL;

// Info GET endpoint
router.get("/info", (req, res, next) => {
  console.log(API_SERVICE_URL);
  res.send("This is a proxy service which proxies to Billing and Account APIs.\n");
});

module.exports = router;

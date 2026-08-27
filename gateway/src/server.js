require("dotenv").config();

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = process.env.PORT || 4000;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere API Gateway"
    });
});

app.get("/health", (req, res) => {
    res.json({
        service: "api-gateway",
        status: "UP"
    });
});

app.use(
    "/products",
    createProxyMiddleware({
        target: PRODUCT_SERVICE_URL,
        changeOrigin: true
    })
);

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
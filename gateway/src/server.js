require("dotenv").config({
    path: "./gateway/.env"
});

require("dotenv").config(); 

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const authenticateToken = require("./middleware/auth.middleware");

const app = express();

const PORT = process.env.PORT || 4000;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const CART_SERVICE_URL = process.env.CART_SERVICE_URL;

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
        changeOrigin: true,
        pathRewrite: (path) => `/products${path}`
    })
);

app.use("/auth/me", authenticateToken);
app.use("/auth/admin", authenticateToken);

app.use(
    "/auth",
    createProxyMiddleware({
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (path) => `/auth${path}`
    })
);

app.use(
    "/cart",
    createProxyMiddleware({
        target: CART_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (path) => `/cart${path}`
    })
);

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
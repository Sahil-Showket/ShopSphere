const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const {
    createProxyMiddleware,
    fixRequestBody
} = require("http-proxy-middleware");

const authenticateToken =
    require("./middleware/auth.middleware");

const app = express();

const PORT =
    process.env.PORT || 4000;

const PRODUCT_SERVICE_URL =
    process.env.PRODUCT_SERVICE_URL ||
    "http://localhost:3000";

const AUTH_SERVICE_URL =
    process.env.AUTH_SERVICE_URL ||
    "http://localhost:3001";

const CART_SERVICE_URL =
    process.env.CART_SERVICE_URL ||
    "http://localhost:3002";

const ORDER_SERVICE_URL =
    process.env.ORDER_SERVICE_URL ||
    "http://localhost:3003";

const PAYMENT_SERVICE_URL =
    process.env.PAYMENT_SERVICE_URL ||
    "http://localhost:3004";

const NOTIFICATION_SERVICE_URL =
    process.env.NOTIFICATION_SERVICE_URL ||
    "http://localhost:3005";


// --------------------------------------------------
// Security
// --------------------------------------------------

app.use(helmet());

const allowedOrigin =
    process.env.CORS_ORIGIN ||
    "http://localhost:5173";

app.use(
    cors({
        origin: allowedOrigin,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// --------------------------------------------------
// JSON body parser
// --------------------------------------------------

app.use(
    express.json({
        limit: "1mb"
    })
);


// --------------------------------------------------
// Rate limiting
// --------------------------------------------------

const apiLimiter =
    rateLimit({
        windowMs:
            Number(
                process.env.RATE_LIMIT_WINDOW_MS
            ) ||
            15 * 60 * 1000,

        limit:
            Number(
                process.env.RATE_LIMIT_MAX
            ) || 100,

        standardHeaders: true,

        legacyHeaders: false,

        message: {
            message:
                "Too many requests. Please try again later."
        }
    });

app.use(apiLimiter);


// --------------------------------------------------
// Health
// --------------------------------------------------

app.get(
    "/health",
    (req, res) => {

        res.status(200).json({
            service: "api-gateway",
            status: "UP"
        });

    }
);


// --------------------------------------------------
// Root
// --------------------------------------------------

app.get(
    "/",
    (req, res) => {

        res.status(200).json({
            message:
                "ShopSphere API Gateway"
        });

    }
);


// --------------------------------------------------
// Order Service
// --------------------------------------------------

app.use(
    "/orders",

    createProxyMiddleware({

        target:
            ORDER_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/orders${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Order Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Order service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// Product Service
// --------------------------------------------------

app.use(
    "/products",

    createProxyMiddleware({

        target:
            PRODUCT_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/products${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Product Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Product service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// Auth protected routes
// --------------------------------------------------

app.use(
    "/auth/me",
    authenticateToken
);

app.use(
    "/auth/admin",
    authenticateToken
);


// --------------------------------------------------
// Auth Service
// --------------------------------------------------

app.use(
    "/auth",

    createProxyMiddleware({

        target:
            AUTH_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/auth${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Auth Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Auth service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// Cart Service
// --------------------------------------------------

app.use(
    "/cart",

    createProxyMiddleware({

        target:
            CART_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/cart${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Cart Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Cart service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// Payment Service
// --------------------------------------------------

app.use(
    "/payments",

    createProxyMiddleware({

        target:
            PAYMENT_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/payments${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Payment Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Payment service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// Notification Service
// --------------------------------------------------

app.use(
    "/notifications",

    createProxyMiddleware({

        target:
            NOTIFICATION_SERVICE_URL,

        changeOrigin:
            true,

        pathRewrite:
            (path) =>
                `/notifications${path}`,

        on: {

            proxyReq:
                fixRequestBody,

            error:
                (err, req, res) => {

                    console.error(
                        "Notification Service proxy error:",
                        err.message
                    );

                    if (!res.headersSent) {

                        res.status(503).json({
                            message:
                                "Notification service unavailable"
                        });

                    }

                }

        }

    })
);


// --------------------------------------------------
// 404
// --------------------------------------------------

app.use(
    (req, res) => {

        res.status(404).json({
            message:
                "Gateway route not found"
        });

    }
);


// --------------------------------------------------
// Global error handler
// --------------------------------------------------

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "Gateway error:",
            err
        );

        if (res.headersSent) {
            return next(err);
        }

        res.status(
            err.statusCode || 500
        ).json({
            message:
                err.message ||
                "Internal gateway error"
        });

    }
);


// --------------------------------------------------
// Start server
// --------------------------------------------------

app.listen(
    PORT,
    () => {

        console.log(
            `API Gateway running on port ${PORT}`
        );

    }
);
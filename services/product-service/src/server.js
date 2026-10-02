require("dotenv").config();

const express = require("express");

const productRoutes =
    require("./routes/product.routes");

const errorMiddleware =
    require("./middleware/error.middleware");

const {
    connectRedis,
    isRedisAvailable
} = require("./config/redis");

const app = express();

const PORT =
    process.env.PORT || 3000;

app.use(
    express.json()
);

app.use(
    "/products",
    productRoutes
);

app.get("/", (
    req,
    res
) => {
    res.json({
        message:
            "ShopSphere Product Service"
    });
});

app.get("/health", (
    req,
    res
) => {

    const redis =
        isRedisAvailable();

    res.status(200).json({

        service:
            "product-service",

        status:
            "UP",

        redis:
            redis
                ? "UP"
                : "DOWN"

    });

});

app.use(
    errorMiddleware
);

const startServer = async () => {

    // Redis is optional.
    // Product Service can run without it.

    await connectRedis();

    app.listen(
        PORT,
        () => {

            console.log(
                `Product Service running on port ${PORT}`
            );

        }
    );

};

if (require.main === module) {
    startServer();
}

module.exports = app;
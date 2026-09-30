const path = require("path");
const { loadEnvFile } = require("node:process");

loadEnvFile(path.join(__dirname, "../.env"));

const express = require("express");

const productRoutes = require("./routes/product.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

const PORT = 3000;

const {
    connectRedis
} = require("./config/redis");

const {
    redisClient
} = require("./config/redis");

app.get("/", (req, res) => {
    res.send("Welcome to ShopSphere Product Service");
});

app.use("/products", productRoutes);
app.get("/health", (req, res) => {

    const redis =
        redisClient.isReady;

    res.status(
        redis ? 200 : 503
    ).json({
        service: "product-service",
        status: redis
            ? "UP"
            : "DEGRADED",
        redis:
            redis
                ? "UP"
                : "DOWN"
    });
});

app.use(errorMiddleware);

const startServer = async () => {

    try {

        await connectRedis();

        app.listen(PORT, () => {

            console.log(
                `Product Service running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Failed to start Product Service:",
            error
        );

        process.exit(1);
    }
};

startServer();
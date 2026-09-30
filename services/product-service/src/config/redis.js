const { createClient } = require("redis");

const REDIS_URL =
    process.env.REDIS_URL ||
    "redis://localhost:6379";

const redisClient =
    createClient({
        url: REDIS_URL
    });

redisClient.on(
    "error",
    (error) => {
        console.error(
            "Redis Client Error:",
            error
        );
    }
);

const connectRedis = async () => {

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    console.log(
        "Product Service connected to Redis"
    );
};

module.exports = {
    redisClient,
    connectRedis
};
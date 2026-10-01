const {
    createClient
} = require("redis");


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
            error.message
        );

    }
);


redisClient.on(
    "connect",
    () => {

        console.log(
            "Redis connecting..."
        );

    }
);


redisClient.on(
    "ready",
    () => {

        console.log(
            "Redis connection ready"
        );

    }
);


redisClient.on(
    "reconnecting",
    () => {

        console.log(
            "Redis reconnecting..."
        );

    }
);


redisClient.on(
    "end",
    () => {

        console.log(
            "Redis connection closed"
        );

    }
);


const connectRedis = async () => {

    try {

        if (!redisClient.isOpen) {

            await redisClient.connect();

        }

        console.log(
            "Product Service connected to Redis"
        );

        return true;

    } catch (error) {

        console.error(
            "Redis connection failed:",
            error.message
        );

        return false;
    }
};


const isRedisAvailable = () => {

    return (
        redisClient.isOpen &&
        redisClient.isReady
    );
};


module.exports = {
    redisClient,
    connectRedis,
    isRedisAvailable
};
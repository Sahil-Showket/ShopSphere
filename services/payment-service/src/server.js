require("dotenv").config();

const express = require("express");

const paymentRoutes =
    require("./routes/payment.routes");

const errorMiddleware =
    require("./middleware/error.middleware");

const {
    connectRabbitMQ
} = require("./config/rabbitmq");

const app = express();

const PORT =
    process.env.PORT || 3004;

app.use(express.json());

app.use(
    "/payments",
    paymentRoutes
);

app.get("/", (req, res) => {

    res.json({
        message:
            "ShopSphere Payment Service"
    });

});

app.get("/health", (req, res) => {

    res.json({
        service:
            "payment-service",

        status:
            "UP"
    });

});

app.use(errorMiddleware);

const startServer = async () => {

    try {

        await connectRabbitMQ();

        app.listen(
            PORT,
            () => {

                console.log(
                    `Payment Service running on port ${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "Failed to start Payment Service:",
            error
        );

        process.exit(1);
    }

};

if (require.main === "module") {
    startServer();
}

module.exports = app;
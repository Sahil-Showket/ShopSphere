require("dotenv").config();

const express = require("express");
const orderRoutes = require("./routes/order.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();
const {
    connectRabbitMQ
} = require("./config/rabbitmq");

app.use(errorMiddleware);

const PORT = process.env.PORT || 3003;

app.use(express.json());

app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere Order Service"
    });
});

app.get("/health", (req, res) => {
    res.json({
        service: "order-service",
        status: "UP"
    });
});

app.use(errorMiddleware);

const startServer = async () => {

    try {

        await connectRabbitMQ();

        app.listen(PORT, () => {

            console.log(
                `Order Service running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Failed to start Order Service:",
            error
        );

        process.exit(1);
    }
};

startServer();
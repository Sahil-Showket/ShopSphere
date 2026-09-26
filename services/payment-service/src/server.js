require("dotenv").config();

const express = require("express");

const paymentRoutes =
    require("./routes/payment.routes");

const errorMiddleware =
    require("./middleware/error.middleware");

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
        message: "ShopSphere Payment Service"
    });
});


app.get("/health", (req, res) => {
    res.json({
        service: "payment-service",
        status: "UP"
    });
});


app.use(errorMiddleware);


app.listen(PORT, () => {
    console.log(
        `Payment Service running on port ${PORT}`
    );
});
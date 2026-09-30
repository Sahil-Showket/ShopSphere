require("dotenv").config();

const express = require("express");

const notificationRoutes =
    require("./routes/notification.routes");

const errorMiddleware =
    require("./middleware/error.middleware");


const app = express();

const PORT =
    process.env.PORT || 3005;


app.use(express.json());


app.use(
    "/notifications",
    notificationRoutes
);


app.get("/", (req, res) => {

    res.json({
        message:
            "ShopSphere Notification Service"
    });

});


app.get("/health", (req, res) => {

    res.json({
        service:
            "notification-service",
        status: "UP"
    });

});


app.use(errorMiddleware);


app.listen(PORT, () => {

    console.log(
        `Notification Service running on port ${PORT}`
    );

});
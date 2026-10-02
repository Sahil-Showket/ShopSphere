require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere Auth Service"
    });
});

app.get("/health", (req, res) => {
    res.json({
        service: "auth-service",
        status: "UP"
    });
});

app.use("/auth", authRoutes);

app.use(errorMiddleware);

module.exports = app;
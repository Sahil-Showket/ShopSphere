require("dotenv").config();

const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
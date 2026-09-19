require("dotenv").config();

const express = require("express");
const cartRoutes = require("./routes/cart.routes");

const app = express();

const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use("/cart", cartRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere Cart Service"
    });
});

app.get("/health", (req, res) => {
    res.json({
        service: "cart-service",
        status: "UP"
    });
});

app.listen(PORT, () => {
    console.log(`Cart Service running on port ${PORT}`);
});
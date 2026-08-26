const path = require("path");
const { loadEnvFile } = require("node:process");

loadEnvFile(path.join(__dirname, "../.env"));

const express = require("express");

const productRoutes = require("./routes/product.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Welcome to ShopSphere Product Service");
});

app.use("/products", productRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
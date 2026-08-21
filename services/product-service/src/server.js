const express = require("express");

const app = express();

app.use(express.json());

const productRoutes = require("./routes/product.routes");

const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Welcome to ShopSphere Product Service");
});

app.use("/products", productRoutes);

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
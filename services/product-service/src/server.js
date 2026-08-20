const express = require("express");

const app = express();

app.use(express.json());

const PORT = 3000;

const productRoutes = require("./routes/product.routes");
const errorHandler = require("./middleware/error.middleware");

app.use("/products", productRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to ShopSphere Product Service");
});

app.get("/error-test", (req, res, next) => {

    const error = new Error("Test error");

    next(error);
});

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
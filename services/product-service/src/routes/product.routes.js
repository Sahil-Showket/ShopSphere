const express = require('express');

const {
    getProducts,
    getProductByControllerId,
    createProduct
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductByControllerId);

router.post("/", createProduct);

module.exports = router;

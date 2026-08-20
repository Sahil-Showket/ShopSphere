const express = require('express');

const {
    getProducts,
    getProductById,
    createProduct
} = require("../controllers/product.controller");

const validateProduct = require("../middleware/product.validation")

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/",validateProduct, createProduct);

module.exports = router;

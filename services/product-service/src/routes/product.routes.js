const express = require("express");

const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct
} = require("../controllers/product.controller");

const validateProduct = require("../middleware/product.validation");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", validateProduct, createProduct);

module.exports = router;
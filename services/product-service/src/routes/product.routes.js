const express = require("express");

const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

const validateProduct = require("../middleware/product.validation");

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", validateProduct, createProduct);

router.put("/:id", validateProduct, updateProduct);

router.delete("/:id", deleteProduct);

module.exports = router;
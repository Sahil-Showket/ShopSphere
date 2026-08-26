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
const validateId = require("../middleware/validateId");

router.get("/", getProducts);

router.get("/:id", validateId, getProductById);

router.post("/", validateProduct, createProduct);

router.put("/:id", validateId, validateProduct, updateProduct);

router.delete("/:id", validateId, deleteProduct);

module.exports = router;
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
const authenticateToken = require("../middleware/auth.middleware");

router.get("/", getProducts);

router.get("/:id", validateId, getProductById);

router.post("/", authenticateToken, validateProduct, createProduct);

router.put(
    "/:id",
    authenticateToken,
    validateId,
    validateProduct,
    updateProduct
);

router.delete("/:id", authenticateToken, validateId, deleteProduct);

module.exports = router;
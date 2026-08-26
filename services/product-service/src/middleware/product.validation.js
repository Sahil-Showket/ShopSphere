const productSchema = require("../schemas/product.schema");

const validateProduct = (req, res, next) => {

    const { name, price } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            message: "Valid product name is required"
        });
    }

    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
        return res.status(400).json({
            message: "Price must be a positive number"
        });
    }

    next();
};

module.exports = validateProduct;
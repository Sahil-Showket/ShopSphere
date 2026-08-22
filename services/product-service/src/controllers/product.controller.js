const productService = require("../services/product.service");

const getProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();

        res.json({
            products
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct(req.body);

        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );

        res.json({
            message: "Product updated",
            product
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        await productService.deleteProduct(req.params.id);

        res.json({
            message: "Product deleted"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
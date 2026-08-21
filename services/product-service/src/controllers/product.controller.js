const productService = require("../services/product.service");

const getProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();

        res.status(200).json({
            products
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { name, price } = req.body;

        const product = await productService.createProduct(
            name,
            price
        );

        res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getProducts,
    getProductById,
    createProduct
};
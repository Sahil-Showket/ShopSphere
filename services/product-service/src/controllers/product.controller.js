const {
    getAllProducts,
    findProductById,
    createProduct: createProductService
} = require("../services/product.service");


const getProducts = async (req, res, next) => {
    try {
        const products = await getAllProducts();

        return res.json(products);
    } catch (error) {
        next(error);
    }
};


const getProductById = async (req, res, next) => {
    try {
        const product = await findProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.json(product);
    } catch (error) {
        next(error);
    }
};


const createProduct = async (req, res, next) => {
    try {
        const product = await createProductService(req.body);

        return res.status(201).json({
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
const {
    getAllProducts,
    findProductById
} = require("../services/product.service");


const getProducts = (req, res) => {

    const products = getAllProducts();

    return res.json(products);
};


const getProductById = (req, res) => {

    const id = Number(req.params.id);

    const product = findProductById(id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    return res.json(product);
};


const createProduct = (req, res) => {

    return res.status(201).json({
        message: "Product created",
        product: req.body
    });
};


module.exports = {
    getProducts,
    getProductById,
    createProduct
};
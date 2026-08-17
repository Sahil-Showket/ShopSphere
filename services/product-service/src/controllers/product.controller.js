const {
    getAllProducts,
    getProductById
} = require("../services/product.service");

const getProducts = (req, res) => {
    const products = getAllProducts();
    res.json(products)
}

const getProductByControllerId = (req, res) => {
    const id = +req.params.id;
    const product = getProductById(id);

    if(!product){
        return res.status(404).json({
            message : "Product not found"
        })
    }

    res.json(product)
}

const createProduct = (req, res) => {
    res.send("Post product")
}

module.exports = {
    getProductByControllerId,
    getProducts,
    createProduct
}
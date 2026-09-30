const productService = require("../services/product.service");

const {
    getCachedProduct,
    cacheProduct,
    deleteCachedProduct
} = require("../services/cache.service");

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
        const productId = Number(req.params.id);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        // 1. Check Redis
        const cachedProduct = await getCachedProduct(productId);

        if (cachedProduct) {
            console.log(
                `Redis cache HIT: product ${productId}`
            );

            return res.status(200).json({
                product: cachedProduct
            });
        }

        // 2. Redis miss → PostgreSQL
        console.log(
            `Redis cache MISS: product ${productId}`
        );

        const product =
            await productService.getProductById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // 3. Store result in Redis
        await cacheProduct(product);

        // 4. Return product
        res.status(200).json({
            product
        });

    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const product =
            await productService.createProduct(req.body);

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
        const product =
            await productService.updateProduct(
                req.params.id,
                req.body
            );

        // Invalidate Redis cache
        await deleteCachedProduct(
            Number(req.params.id)
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
        const product =
            await productService.deleteProduct(
                req.params.id
            );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Invalidate Redis cache
        await deleteCachedProduct(
            Number(req.params.id)
        );

        res.status(200).json({
            message: "Product deleted successfully"
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
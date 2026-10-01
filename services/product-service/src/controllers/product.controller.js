const prisma =
    require("../config/prisma");

const AppError =
    require("../utils/AppError");

const {
    getCachedProduct,
    cacheProduct,
    deleteCachedProduct,
    getCachedProducts,
    cacheProducts,
    deleteCachedProducts
} = require("../services/cache.service");


// ========================================
// CREATE PRODUCT
// ========================================

const createProduct = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            price
        } = req.body;


        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            throw new AppError(
                "Product name is required",
                400
            );

        }


        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {

            throw new AppError(
                "Product price must be greater than 0",
                400
            );

        }


        const product =
            await prisma.product.create({
                data: {
                    name: name.trim(),
                    price
                }
            });


        // Redis failure must not
        // prevent product creation
        await deleteCachedProducts();


        res.status(201).json({
            product
        });

    } catch (error) {

        next(error);

    }
};


// ========================================
// GET ALL PRODUCTS
// ========================================

const getProducts = async (
    req,
    res,
    next
) => {

    try {

        const cachedProducts =
            await getCachedProducts();


        if (cachedProducts) {

            console.log(
                "Redis cache HIT: products:all"
            );

            return res.status(200).json({
                products: cachedProducts
            });

        }


        console.log(
            "Redis cache MISS: products:all"
        );


        const products =
            await prisma.product.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            });


        await cacheProducts(
            products
        );


        res.status(200).json({
            products
        });

    } catch (error) {

        next(error);

    }
};


// ========================================
// GET PRODUCT BY ID
// ========================================

const getProductById = async (
    req,
    res,
    next
) => {

    try {

        const productId =
            Number(req.params.id);


        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            throw new AppError(
                "Invalid product ID",
                400
            );

        }


        const cachedProduct =
            await getCachedProduct(
                productId
            );


        if (cachedProduct) {

            console.log(
                `Redis cache HIT: product ${productId}`
            );

            return res.status(200).json({
                product: cachedProduct
            });

        }


        console.log(
            `Redis cache MISS: product ${productId}`
        );


        const product =
            await prisma.product.findUnique({
                where: {
                    id: productId
                }
            });


        if (!product) {

            throw new AppError(
                "Product not found",
                404
            );

        }


        await cacheProduct(
            product
        );


        res.status(200).json({
            product
        });

    } catch (error) {

        next(error);

    }
};


// ========================================
// UPDATE PRODUCT
// ========================================

const updateProduct = async (
    req,
    res,
    next
) => {

    try {

        const productId =
            Number(req.params.id);


        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            throw new AppError(
                "Invalid product ID",
                400
            );

        }


        const {
            name,
            price
        } = req.body;


        if (
            typeof name !== "string" ||
            !name.trim()
        ) {

            throw new AppError(
                "Product name is required",
                400
            );

        }


        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {

            throw new AppError(
                "Product price must be greater than 0",
                400
            );

        }


        const existingProduct =
            await prisma.product.findUnique({
                where: {
                    id: productId
                }
            });


        if (!existingProduct) {

            throw new AppError(
                "Product not found",
                404
            );

        }


        const updatedProduct =
            await prisma.product.update({
                where: {
                    id: productId
                },
                data: {
                    name: name.trim(),
                    price
                }
            });


        await deleteCachedProduct(
            productId
        );

        await deleteCachedProducts();


        res.status(200).json({
            product: updatedProduct
        });

    } catch (error) {

        next(error);

    }
};


// ========================================
// DELETE PRODUCT
// ========================================

const deleteProduct = async (
    req,
    res,
    next
) => {

    try {

        const productId =
            Number(req.params.id);


        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            throw new AppError(
                "Invalid product ID",
                400
            );

        }


        const existingProduct =
            await prisma.product.findUnique({
                where: {
                    id: productId
                }
            });


        if (!existingProduct) {

            throw new AppError(
                "Product not found",
                404
            );

        }


        await prisma.product.delete({
            where: {
                id: productId
            }
        });


        await deleteCachedProduct(
            productId
        );

        await deleteCachedProducts();


        res.status(200).json({
            message:
                "Product deleted successfully"
        });

    } catch (error) {

        next(error);

    }
};


module.exports = {

    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct

};
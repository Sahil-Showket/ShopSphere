const {
    redisClient,
    isRedisAvailable
} = require("../config/redis");


const PRODUCT_CACHE_TTL = 60;


// ========================================
// CACHE KEYS
// ========================================

const getProductCacheKey = (
    productId
) => {

    return `product:${productId}`;

};


const getProductsCacheKey = () => {

    return "products:all";

};


// ========================================
// GET SINGLE PRODUCT FROM CACHE
// ========================================

const getCachedProduct = async (
    productId
) => {

    if (!isRedisAvailable()) {

        console.log(
            "Redis unavailable - skipping product cache"
        );

        return null;
    }

    try {

        const key =
            getProductCacheKey(
                productId
            );

        const cached =
            await redisClient.get(key);

        if (!cached) {

            return null;
        }

        return JSON.parse(
            cached
        );

    } catch (error) {

        console.error(
            "Redis GET product failed:",
            error.message
        );

        return null;
    }
};


// ========================================
// CACHE SINGLE PRODUCT
// ========================================

const cacheProduct = async (
    product
) => {

    if (!isRedisAvailable()) {

        return;
    }

    try {

        const key =
            getProductCacheKey(
                product.id
            );

        await redisClient.set(
            key,
            JSON.stringify(product),
            {
                EX: PRODUCT_CACHE_TTL
            }
        );

    } catch (error) {

        console.error(
            "Redis SET product failed:",
            error.message
        );
    }
};


// ========================================
// DELETE SINGLE PRODUCT CACHE
// ========================================

const deleteCachedProduct = async (
    productId
) => {

    if (!isRedisAvailable()) {

        return;
    }

    try {

        const key =
            getProductCacheKey(
                productId
            );

        await redisClient.del(
            key
        );

    } catch (error) {

        console.error(
            "Redis DELETE product failed:",
            error.message
        );
    }
};


// ========================================
// GET ALL PRODUCTS FROM CACHE
// ========================================

const getCachedProducts = async () => {

    if (!isRedisAvailable()) {

        console.log(
            "Redis unavailable - skipping products cache"
        );

        return null;
    }

    try {

        const key =
            getProductsCacheKey();

        const cached =
            await redisClient.get(key);

        if (!cached) {

            return null;
        }

        return JSON.parse(
            cached
        );

    } catch (error) {

        console.error(
            "Redis GET products failed:",
            error.message
        );

        return null;
    }
};


// ========================================
// CACHE ALL PRODUCTS
// ========================================

const cacheProducts = async (
    products
) => {

    if (!isRedisAvailable()) {

        return;
    }

    try {

        const key =
            getProductsCacheKey();

        await redisClient.set(
            key,
            JSON.stringify(products),
            {
                EX: PRODUCT_CACHE_TTL
            }
        );

    } catch (error) {

        console.error(
            "Redis SET products failed:",
            error.message
        );
    }
};


// ========================================
// DELETE ALL PRODUCTS CACHE
// ========================================

const deleteCachedProducts = async () => {

    if (!isRedisAvailable()) {

        return;
    }

    try {

        const key =
            getProductsCacheKey();

        await redisClient.del(
            key
        );

    } catch (error) {

        console.error(
            "Redis DELETE products failed:",
            error.message
        );
    }
};


// ========================================
// EXPORTS
// ========================================

module.exports = {

    getCachedProduct,
    cacheProduct,
    deleteCachedProduct,

    getCachedProducts,
    cacheProducts,
    deleteCachedProducts,

    getProductCacheKey,
    getProductsCacheKey
};
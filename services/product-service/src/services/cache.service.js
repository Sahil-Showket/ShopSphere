const {
    redisClient
} = require("../config/redis");


const PRODUCT_CACHE_TTL = 60;

const getProductCacheKey = (
    productId
) => {
    return `product:${productId}`;
};

const getProductsCacheKey = () => {
    return "products:all";
};


const getCachedProduct = async (
    productId
) => {

    const key =
        getProductCacheKey(productId);

    const cached =
        await redisClient.get(key);

    if (!cached) {
        return null;
    }

    return JSON.parse(cached);
};


const cacheProduct = async (
    product
) => {

    const key =
        getProductCacheKey(product.id);

    await redisClient.set(
        key,
        JSON.stringify(product),
        {
            EX: PRODUCT_CACHE_TTL
        }
    );
};


const deleteCachedProduct = async (
    productId
) => {

    const key =
        getProductCacheKey(productId);

    await redisClient.del(key);
};


const getCachedProducts = async () => {

    const key =
        getProductsCacheKey();

    const cached =
        await redisClient.get(key);

    if (!cached) {
        return null;
    }

    return JSON.parse(cached);
};


const cacheProducts = async (
    products
) => {

    const key =
        getProductsCacheKey();

    await redisClient.set(
        key,
        JSON.stringify(products),
        {
            EX: PRODUCT_CACHE_TTL
        }
    );
};


const deleteCachedProducts = async () => {

    const key =
        getProductsCacheKey();

    await redisClient.del(key);
};


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
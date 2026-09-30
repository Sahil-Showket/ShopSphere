const {
    redisClient
} = require("../config/redis");


const PRODUCT_CACHE_TTL = 60;


const getCachedProduct = async (
    productId
) => {

    const key =
        `product:${productId}`;

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
        `product:${product.id}`;

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
        `product:${productId}`;

    await redisClient.del(key);
};


module.exports = {
    getCachedProduct,
    cacheProduct,
    deleteCachedProduct
};
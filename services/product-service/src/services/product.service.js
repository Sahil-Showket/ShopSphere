const prisma = require("../lib/prisma");

const getAllProducts = async () => {
    return await prisma.product.findMany({
        orderBy: {
            id: "asc"
        }
    });
};

const findProductById = async (id) => {
    return await prisma.product.findUnique({
        where: {
            id: Number(id)
        }
    });
};

const createProduct = async (productData) => {
    return await prisma.product.create({
        data: {
            name: productData.name,
            price: productData.price
        }
    });
};

module.exports = {
    getAllProducts,
    findProductById,
    createProduct
};
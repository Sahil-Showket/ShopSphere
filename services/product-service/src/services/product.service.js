const prisma = require("../config/prisma");

const getAllProducts = async () => {
    return await prisma.product.findMany();
};

const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: {
            id: id
        }
    });
};

const createProduct = async (name, price) => {
    return await prisma.product.create({
        data: {
            name,
            price
        }
    });
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct
};
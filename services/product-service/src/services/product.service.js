const prisma = require("../config/prisma");

const getAllProducts = async () => {
    return await prisma.product.findMany();
};

const getProductById = async (id) => {
    return await prisma.product.findUnique({
        where: {
            id: Number(id)
        }
    });
};

const createProduct = async (data) => {
    return await prisma.product.create({
        data: {
            name: data.name,
            price: data.price
        }
    });
};

const updateProduct = async (id, data) => {
    return await prisma.product.update({
        where: {
            id: Number(id)
        },
        data: {
            name: data.name,
            price: data.price
        }
    });
};

const deleteProduct = async (id) => {
    const product = await prisma.product.findUnique({
        where: {
            id: Number(id)
        }
    });

    if (!product) {
        return null;
    }

    return await prisma.product.delete({
        where: {
            id: Number(id)
        }
    });
};


module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
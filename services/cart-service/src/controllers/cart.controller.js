const prisma = require("../config/prisma");

const getCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        let cart = await prisma.cart.findUnique({
            where: {
                userId: userId
            },
            include: {
                items: true
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId
                },
                include: {
                    items: true
                }
            });
        }

        res.json(cart);
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;

        let cart = await prisma.cart.findUnique({
            where: {
                userId: userId
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: userId
                }
            });
        }

        const item = await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: productId
                }
            },
            update: {
                quantity: {
                    increment: quantity || 1
                }
            },
            create: {
                cartId: cart.id,
                productId: productId,
                quantity: quantity || 1
            }
        });

        res.status(201).json({
            message: "Product added to cart",
            item
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart
};
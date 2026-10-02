const {
    getProductById
} = require("../services/product.service");

const prisma =
    require("../config/prisma");

const getCart = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        let cart =
            await prisma.cart.findUnique({
                where: {
                    userId: userId
                },
                include: {
                    items: true
                }
            });

        if (!cart) {

            cart =
                await prisma.cart.create({
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

const addToCart = async (
    req,
    res,
    next
) => {

    const {
        productId,
        quantity
    } = req.body;

    try {

        await getProductById(
            productId
        );

    } catch (error) {

        return res.status(404).json({
            message:
                "Product not found"
        });
    }

    try {

        const userId =
            req.user.userId;

        let cart =
            await prisma.cart.findUnique({
                where: {
                    userId: userId
                }
            });

        if (!cart) {

            cart =
                await prisma.cart.create({
                    data: {
                        userId: userId
                    }
                });
        }

        const item =
            await prisma.cartItem.upsert({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId
                    }
                },

                update: {
                    quantity: {
                        increment:
                            quantity || 1
                    }
                },

                create: {
                    cartId: cart.id,
                    productId: productId,
                    quantity:
                        quantity || 1
                }
            });

        res.status(201).json({
            message:
                "Product added to cart",
            item
        });

    } catch (error) {

        next(error);
    }
};

const updateCartItem = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const productId =
            Number(req.params.productId);

        const quantity =
            Number(req.body.quantity);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid product ID"
            });
        }

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {

            return res.status(400).json({
                message:
                    "Quantity must be a positive integer"
            });
        }

        const cart =
            await prisma.cart.findUnique({
                where: {
                    userId: userId
                }
            });

        if (!cart) {

            return res.status(404).json({
                message:
                    "Cart not found"
            });
        }

        const existingItem =
            await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId
                    }
                }
            });

        if (!existingItem) {

            return res.status(404).json({
                message:
                    "Cart item not found"
            });
        }

        const item =
            await prisma.cartItem.update({
                where: {
                    id: existingItem.id
                },
                data: {
                    quantity: quantity
                }
            });

        res.json({
            message:
                "Cart item updated",
            item
        });

    } catch (error) {

        next(error);
    }
};

const removeCartItem = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.userId;

        const productId =
            Number(req.params.productId);

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {

            return res.status(400).json({
                message:
                    "Invalid product ID"
            });
        }

        const cart =
            await prisma.cart.findUnique({
                where: {
                    userId: userId
                }
            });

        if (!cart) {

            return res.status(404).json({
                message:
                    "Cart not found"
            });
        }

        const existingItem =
            await prisma.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId
                    }
                }
            });

        if (!existingItem) {

            return res.status(404).json({
                message:
                    "Cart item not found"
            });
        }

        await prisma.cartItem.delete({
            where: {
                id: existingItem.id
            }
        });

        res.json({
            message:
                "Cart item removed"
        });

    } catch (error) {

        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem
};
const prisma = require("../config/prisma");
const { getCart } = require("../services/cart.service");
const { getProductById } = require("../services/product.service");

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];

        // Get user's cart
        const cart = await getCart(token);

        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Get product prices
        const orderItems = await Promise.all(
            cart.items.map(async (item) => {
                const product = await getProductById(item.productId);

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                };
            })
        );

        // Calculate total
        const total = orderItems.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);

        // Create order
        const order = await prisma.order.create({
            data: {
                userId,
                total,
                items: {
                    create: orderItems
                }
            },
            include: {
                items: true
            }
        });

        res.status(201).json(order);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder
};
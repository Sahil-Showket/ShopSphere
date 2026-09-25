const prisma = require("../config/prisma");
const { getCart } = require("../services/cart.service");
const { getProductById } = require("../services/product.service");
const AppError = require("../utils/AppError");

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                "Authorization header missing",
                401
            );
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new AppError(
                "Token missing",
                401
            );
        }

        // Get user's cart
        const cart = await getCart(token);

        if (!cart.items || cart.items.length === 0) {
            throw new AppError(
                "Cart is empty",
                400
            );
        }

        // Validate quantities and get product prices
        const orderItems = await Promise.all(
            cart.items.map(async (item) => {

                if (
                    !Number.isInteger(item.quantity) ||
                    item.quantity <= 0
                ) {
                    throw new AppError(
                        `Invalid quantity for product ${item.productId}`,
                        400
                    );
                }

                const product = await getProductById(
                    item.productId
                );

                if (
                    typeof product.price !== "number" ||
                    product.price <= 0
                ) {
                    throw new AppError(
                        `Invalid price for product ${item.productId}`,
                        500
                    );
                }

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                };
            })
        );

        // Calculate total
        const total = orderItems.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );

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
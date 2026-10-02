const request = require("supertest");
const jwt = require("jsonwebtoken");

const AppError = require("../src/utils/AppError");

/*
|--------------------------------------------------------------------------
| Mock service modules BEFORE importing the app
|--------------------------------------------------------------------------
*/

jest.mock("../src/services/cart.service", () => ({
    getCart: jest.fn()
}));

jest.mock("../src/services/product.service", () => ({
    getProductById: jest.fn()
}));

jest.mock("../src/services/event.service", () => ({
    publishEvent: jest.fn()
}));

const cartService =
    require("../src/services/cart.service");

const productService =
    require("../src/services/product.service");

const eventService =
    require("../src/services/event.service");

const app =
    require("../src/server");

const prisma =
    require("../src/config/prisma");


/*
|--------------------------------------------------------------------------
| Test authentication
|--------------------------------------------------------------------------
*/

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere_super_secret_change_later";

const userId = 999;

const token = jwt.sign(
    {
        userId,
        email: "order-test@example.com",
        role: "user"
    },
    JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

const authHeader =
    `Bearer ${token}`;


/*
|--------------------------------------------------------------------------
| Tests
|--------------------------------------------------------------------------
*/

describe("Order Service API", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });


    afterAll(async () => {

        await prisma.order.deleteMany({
            where: {
                userId
            }
        });

        await prisma.$disconnect();

    });


    test("GET /health should return service status", async () => {

        const response =
            await request(app)
                .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual({
                service: "order-service",
                status: "UP"
            });

    });


    test("GET / should return Order Service message", async () => {

        const response =
            await request(app)
                .get("/");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual({
                message:
                    "ShopSphere Order Service"
            });

    });


    test("POST /orders should reject missing token", async () => {

        const response =
            await request(app)
                .post("/orders");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("GET /orders should reject missing token", async () => {

        const response =
            await request(app)
                .get("/orders");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("GET /orders/:id should reject missing token", async () => {

        const response =
            await request(app)
                .get("/orders/1");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("POST /orders should reject invalid token", async () => {

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    "Bearer invalid-token"
                );

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Invalid or expired token"
            );

    });


    test("GET /orders should return user's orders", async () => {

        const response =
            await request(app)
                .get("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(200);

        expect(
            Array.isArray(
                response.body.orders
            )
        ).toBe(true);

    });


    test("POST /orders should reject an empty cart", async () => {

        cartService.getCart
            .mockResolvedValueOnce({
                items: []
            });

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Cart is empty"
            );

    });


    test("POST /orders should return 503 when Cart Service is unavailable", async () => {

        cartService.getCart
            .mockRejectedValueOnce(
                new AppError(
                    "Cart service unavailable",
                    503
                )
            );

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(503);

        expect(response.body.message)
            .toBe(
                "Cart service unavailable"
            );

    });


    test("POST /orders should reject invalid quantity", async () => {

        cartService.getCart
            .mockResolvedValueOnce({
                items: [
                    {
                        productId: 6,
                        quantity: 0
                    }
                ]
            });

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid quantity for product 6"
            );

    });


    test("POST /orders should return product error", async () => {

        cartService.getCart
            .mockResolvedValueOnce({
                items: [
                    {
                        productId: 6,
                        quantity: 2
                    }
                ]
            });

        productService.getProductById
            .mockRejectedValueOnce(
                new AppError(
                    "Product service unavailable",
                    503
                )
            );

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(503);

        expect(response.body.message)
            .toBe(
                "Product service unavailable"
            );

    });


    test("POST /orders should create an order", async () => {

        cartService.getCart
            .mockResolvedValueOnce({
                items: [
                    {
                        productId: 6,
                        quantity: 2
                    },
                    {
                        productId: 7,
                        quantity: 1
                    }
                ]
            });

        productService.getProductById
            .mockResolvedValueOnce({
                id: 6,
                name: "Docker Test Laptop",
                price: 85000
            })
            .mockResolvedValueOnce({
                id: 7,
                name: "Test Product",
                price: 1500
            });

        eventService.publishEvent
            .mockResolvedValueOnce();

        const response =
            await request(app)
                .post("/orders")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.userId)
            .toBe(userId);

        expect(response.body.total)
            .toBe(171500);

        expect(response.body.status)
            .toBe("PENDING");

        expect(
            Array.isArray(
                response.body.items
            )
        ).toBe(true);

        expect(response.body.items)
            .toHaveLength(2);

        expect(
            eventService.publishEvent
        ).toHaveBeenCalledWith(
            "order.confirmed",
            expect.objectContaining({
                userId,
                total: 171500
            })
        );

    });


    test("GET /orders/:id should return user's order", async () => {

        const order =
            await prisma.order.create({
                data: {
                    userId,
                    total: 10000,
                    items: {
                        create: [
                            {
                                productId: 6,
                                quantity: 1,
                                price: 10000
                            }
                        ]
                    }
                },
                include: {
                    items: true
                }
            });

        const response =
            await request(app)
                .get(
                    `/orders/${order.id}`
                )
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(order.id);

        expect(response.body.userId)
            .toBe(userId);

        expect(response.body.total)
            .toBe(10000);

        expect(
            Array.isArray(
                response.body.items
            )
        ).toBe(true);

    });


    test("GET /orders/:id should reject invalid ID", async () => {

        const response =
            await request(app)
                .get("/orders/abc")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid order ID"
            );

    });


    test("GET /orders/:id should reject zero ID", async () => {

        const response =
            await request(app)
                .get("/orders/0")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid order ID"
            );

    });


    test("GET /orders/:id should return 404 for missing order", async () => {

        const response =
            await request(app)
                .get("/orders/99999999")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe(
                "Order not found"
            );

    });

});
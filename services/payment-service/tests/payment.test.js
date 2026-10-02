const request = require("supertest");
const jwt = require("jsonwebtoken");

const AppError =
    require("../src/utils/AppError");


/*
|--------------------------------------------------------------------------
| Mock Payment Service
|--------------------------------------------------------------------------
*/

jest.mock(
    "../src/services/payment.service",
    () => ({
        processPayment: jest.fn()
    })
);


/*
|--------------------------------------------------------------------------
| Mock Order Service
|--------------------------------------------------------------------------
*/

jest.mock(
    "../src/services/order.service",
    () => ({
        getOrderById: jest.fn(),
        confirmOrderAfterPayment: jest.fn()
    })
);


/*
|--------------------------------------------------------------------------
| Mock Event Service
|--------------------------------------------------------------------------
*/

jest.mock(
    "../src/services/event.service",
    () => ({
        publishEvent: jest.fn()
    })
);


const paymentService =
    require("../src/services/payment.service");

const orderService =
    require("../src/services/order.service");

const eventService =
    require("../src/services/event.service");

const app =
    require("../src/server");

const prisma =
    require("../src/config/prisma");


/*
|--------------------------------------------------------------------------
| Test Authentication
|--------------------------------------------------------------------------
*/

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere_super_secret_change_later";

const userId = 888;

const token = jwt.sign(
    {
        userId,
        email: "payment-test@example.com",
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

describe("Payment Service API", () => {

    beforeEach(() => {

        jest.clearAllMocks();

    });


    afterAll(async () => {

        await prisma.payment.deleteMany({
            where: {
                userId
            }
        });

        await prisma.$disconnect();

    });


    /*
    |--------------------------------------------------------------------------
    | Basic Routes
    |--------------------------------------------------------------------------
    */

    test("GET /health should return service status", async () => {

        const response =
            await request(app)
                .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual({
                service:
                    "payment-service",

                status:
                    "UP"
            });

    });


    test("GET / should return Payment Service message", async () => {

        const response =
            await request(app)
                .get("/");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toEqual({
                message:
                    "ShopSphere Payment Service"
            });

    });


    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    test("POST /payments should reject missing token", async () => {

        const response =
            await request(app)
                .post("/payments")
                .send({
                    orderId: 1
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("GET /payments should reject missing token", async () => {

        const response =
            await request(app)
                .get("/payments");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("POST /payments should reject invalid token", async () => {

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    "Bearer invalid-token"
                )
                .send({
                    orderId: 1
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Invalid or expired token"
            );

    });


    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    test("POST /payments should reject invalid order ID", async () => {

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: "abc"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid order ID"
            );

    });


    test("POST /payments should reject missing order ID", async () => {

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({});

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid order ID"
            );

    });


    /*
    |--------------------------------------------------------------------------
    | Order Service
    |--------------------------------------------------------------------------
    */

    test("POST /payments should return 503 when Order Service is unavailable", async () => {

        orderService.getOrderById
            .mockRejectedValueOnce(
                new AppError(
                    "Order service unavailable",
                    503
                )
            );

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 1
                });

        expect(response.statusCode)
            .toBe(503);

        expect(response.body.message)
            .toBe(
                "Order service unavailable"
            );

    });


    test("POST /payments should return 404 when order does not exist", async () => {

        orderService.getOrderById
            .mockRejectedValueOnce(
                new AppError(
                    "Order not found",
                    404
                )
            );

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 999999
                });

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe(
                "Order not found"
            );

    });


    test("POST /payments should reject order belonging to another user", async () => {

        orderService.getOrderById
            .mockResolvedValueOnce({
                id: 1,
                userId: 9999,
                total: 1000,
                status: "PENDING"
            });

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 1
                });

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.message)
            .toBe(
                "You are not allowed to pay for this order"
            );

    });


    /*
    |--------------------------------------------------------------------------
    | Order Status
    |--------------------------------------------------------------------------
    */

    test("POST /payments should reject cancelled order", async () => {

        orderService.getOrderById
            .mockResolvedValueOnce({
                id: 2,
                userId,
                total: 1000,
                status: "CANCELLED"
            });

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 2
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Cannot pay for a cancelled order"
            );

    });


    test("POST /payments should reject delivered order", async () => {

        orderService.getOrderById
            .mockResolvedValueOnce({
                id: 3,
                userId,
                total: 1000,
                status: "DELIVERED"
            });

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 3
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Order has already been completed"
            );

    });


    /*
    |--------------------------------------------------------------------------
    | Invalid Order Total
    |--------------------------------------------------------------------------
    */

    test("POST /payments should reject invalid order total", async () => {

    orderService.getOrderById
        .mockResolvedValueOnce({
            id: 600,
            userId,
            total: 0,
            status: "PENDING"
        });

    const response =
        await request(app)
            .post("/payments")
            .set(
                "Authorization",
                authHeader
            )
            .send({
                orderId: 600
            });

    expect(response.statusCode)
        .toBe(500);

    expect(response.body.message)
        .toBe(
            "Invalid order total"
        );

});


    /*
    |--------------------------------------------------------------------------
    | Successful Payment
    |--------------------------------------------------------------------------
    */

    test("POST /payments should create successful payment", async () => {

        orderService.getOrderById
            .mockResolvedValueOnce({
                id: 100,
                userId,
                total: 2500,
                status: "PENDING"
            });

        paymentService.processPayment
            .mockResolvedValueOnce({
                success: true,
                transactionId:
                    "TXN-TEST-100",
                amount: 2500
            });

        orderService.confirmOrderAfterPayment
            .mockResolvedValueOnce();

        eventService.publishEvent
            .mockResolvedValueOnce();

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 100
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body)
            .toHaveProperty("id");

        expect(response.body.userId)
            .toBe(userId);

        expect(response.body.orderId)
            .toBe(100);

        expect(response.body.amount)
            .toBe(2500);

        expect(response.body.status)
            .toBe("SUCCESS");

        expect(response.body.transactionId)
            .toBe("TXN-TEST-100");

        expect(
            paymentService.processPayment
        ).toHaveBeenCalledWith(
            2500
        );

        expect(
            orderService.confirmOrderAfterPayment
        ).toHaveBeenCalledWith(
            100
        );

        expect(
            eventService.publishEvent
        ).toHaveBeenCalledWith(
            "payment.success",
            expect.objectContaining({
                userId,
                orderId: 100,
                amount: 2500,
                transactionId:
                    "TXN-TEST-100"
            })
        );

    });


    /*
    |--------------------------------------------------------------------------
    | Duplicate Payment
    |--------------------------------------------------------------------------
    */

    test("POST /payments should reject duplicate payment", async () => {

        const existingPayment =
            await prisma.payment.create({
                data: {
                    orderId: 200,
                    userId,
                    amount: 5000,
                    status: "SUCCESS",
                    transactionId:
                        "TXN-DUPLICATE-TEST"
                }
            });

        orderService.getOrderById
            .mockResolvedValueOnce({
                id: 200,
                userId,
                total: 5000,
                status: "PENDING"
            });

        const response =
            await request(app)
                .post("/payments")
                .set(
                    "Authorization",
                    authHeader
                )
                .send({
                    orderId: 200
                });

        expect(response.statusCode)
            .toBe(409);

        expect(response.body.message)
            .toBe(
                "Payment already exists for this order"
            );

        await prisma.payment.delete({
            where: {
                id: existingPayment.id
            }
        });

    });


    /*
    |--------------------------------------------------------------------------
    | Payment Retrieval
    |--------------------------------------------------------------------------
    */

    test("GET /payments should return user's payments", async () => {

        await prisma.payment.create({
            data: {
                orderId: 300,
                userId,
                amount: 1500,
                status: "SUCCESS",
                transactionId:
                    "TXN-LIST-TEST"
            }
        });

        const response =
            await request(app)
                .get("/payments")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(200);

        expect(
            Array.isArray(
                response.body.payments
            )
        ).toBe(true);

    });


    test("GET /payments/:id should return user's payment", async () => {

        const payment =
            await prisma.payment.create({
                data: {
                    orderId: 400,
                    userId,
                    amount: 3000,
                    status: "SUCCESS",
                    transactionId:
                        "TXN-GET-TEST"
                }
            });

        const response =
            await request(app)
                .get(
                    `/payments/${payment.id}`
                )
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(payment.id);

        expect(response.body.userId)
            .toBe(userId);

        expect(response.body.amount)
            .toBe(3000);

    });


    test("GET /payments/:id should reject invalid ID", async () => {

        const response =
            await request(app)
                .get("/payments/abc")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe(
                "Invalid payment ID"
            );

    });


    test("GET /payments/:id should return 404 for missing payment", async () => {

        const response =
            await request(app)
                .get("/payments/99999999")
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe(
                "Payment not found"
            );

    });


    test("GET /payments/:id should reject payment belonging to another user", async () => {

        const payment =
            await prisma.payment.create({
                data: {
                    orderId: 500,
                    userId: 7777,
                    amount: 2000,
                    status: "SUCCESS",
                    transactionId:
                        "TXN-OWNER-TEST"
                }
            });

        const response =
            await request(app)
                .get(
                    `/payments/${payment.id}`
                )
                .set(
                    "Authorization",
                    authHeader
                );

        expect(response.statusCode)
            .toBe(403);

        expect(response.body.message)
            .toBe(
                "You are not allowed to access this payment"
            );

        await prisma.payment.delete({
            where: {
                id: payment.id
            }
        });

    });

});
const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/server");
const prisma = require("../src/config/prisma");

const productService =
    require("../src/services/product.service");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere_super_secret_change_later";

const createToken = (
    userId = 999,
    role = "user"
) => {

    return jwt.sign(
        {
            userId,
            email: "cart-test@shopsphere.com",
            role
        },
        JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
};

describe("Cart Service API", () => {

    const userId = 999;

    let token;
    let cartId;
    let itemId;

    beforeAll(() => {

        token =
            createToken(userId);

    });


    // ========================================
    // HEALTH
    // ========================================

    test("GET /health should return service status", async () => {

        const response =
            await request(app)
                .get("/health");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.service)
            .toBe("cart-service");

        expect(response.body.status)
            .toBe("UP");

    });


    // ========================================
    // ROOT
    // ========================================

    test("GET / should return Cart Service message", async () => {

        const response =
            await request(app)
                .get("/");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.message)
            .toBe(
                "ShopSphere Cart Service"
            );

    });


    // ========================================
    // AUTHENTICATION
    // ========================================

    test("GET /cart should reject missing token", async () => {

        const response =
            await request(app)
                .get("/cart");

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("POST /cart/items should reject missing token", async () => {

        const response =
            await request(app)
                .post("/cart/items")
                .send({
                    productId: 6,
                    quantity: 1
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Authorization header missing"
            );

    });


    test("GET /cart should reject invalid token", async () => {

        const response =
            await request(app)
                .get("/cart")
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


    test("POST /cart/items should reject malformed authorization header", async () => {

        const response =
            await request(app)
                .post("/cart/items")
                .set(
                    "Authorization",
                    "InvalidFormat"
                )
                .send({
                    productId: 6,
                    quantity: 1
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe(
                "Token missing"
            );

    });


    // ========================================
    // MOCK PRODUCT SERVICE
    // ========================================

    test("POST /cart/items should return 404 when Product Service fails", async () => {

        jest.spyOn(
            productService,
            "getProductById"
        ).mockRejectedValueOnce(
            new Error("Product Service unavailable")
        );

        const response =
            await request(app)
                .post("/cart/items")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    productId: 999999,
                    quantity: 1
                });

        expect(response.statusCode)
            .toBe(404);

        expect(response.body.message)
            .toBe(
                "Product not found"
            );

    });


    // ========================================
    // GET CART
    // ========================================

    test("GET /cart should create an empty cart for a new user", async () => {

        const response =
            await request(app)
                .get("/cart")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toHaveProperty("id");

        expect(response.body.userId)
            .toBe(userId);

        expect(response.body)
            .toHaveProperty("items");

        expect(
            Array.isArray(response.body.items)
        ).toBe(true);

        cartId =
            response.body.id;

    });


    // ========================================
    // MOCK SUCCESSFUL PRODUCT
    // ========================================

    test("POST /cart/items should add a product to cart", async () => {

        jest.spyOn(
            productService,
            "getProductById"
        ).mockResolvedValueOnce({
            product: {
                id: 6,
                name: "Test Laptop",
                price: 85000
            }
        });

        const response =
            await request(app)
                .post("/cart/items")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    productId: 6,
                    quantity: 2
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.message)
            .toBe(
                "Product added to cart"
            );

        expect(response.body)
            .toHaveProperty("item");

        expect(response.body.item.productId)
            .toBe(6);

        expect(response.body.item.quantity)
            .toBe(2);

        itemId =
            response.body.item.id;

    });


    // ========================================
    // GET CART WITH ITEM
    // ========================================

    test("GET /cart should return cart with items", async () => {

        const response =
            await request(app)
                .get("/cart")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.id)
            .toBe(cartId);

        expect(response.body.userId)
            .toBe(userId);

        expect(
            Array.isArray(response.body.items)
        ).toBe(true);

        expect(
            response.body.items.length
        ).toBeGreaterThan(0);

        const item =
            response.body.items.find(
                (cartItem) =>
                    cartItem.id === itemId
            );

        expect(item)
            .toBeDefined();

        expect(item.productId)
            .toBe(6);

        expect(item.quantity)
            .toBe(2);

    });


    // ========================================
    // UPSERT / ADD SAME PRODUCT
    // ========================================

    test("POST /cart/items should increase quantity for existing product", async () => {

        jest.spyOn(
            productService,
            "getProductById"
        ).mockResolvedValueOnce({
            product: {
                id: 6,
                name: "Test Laptop",
                price: 85000
            }
        });

        const response =
            await request(app)
                .post("/cart/items")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    productId: 6,
                    quantity: 3
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.item.productId)
            .toBe(6);

        expect(response.body.item.quantity)
            .toBe(5);

    });


    // ========================================
    // DEFAULT QUANTITY
    // ========================================

    test("POST /cart/items should use quantity 1 when quantity is omitted", async () => {

        jest.spyOn(
            productService,
            "getProductById"
        ).mockResolvedValueOnce({
            product: {
                id: 7,
                name: "Test Mouse",
                price: 1500
            }
        });

        const response =
            await request(app)
                .post("/cart/items")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    productId: 7
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body.item.productId)
            .toBe(7);

        expect(response.body.item.quantity)
            .toBe(1);

    });


    // ========================================
    // CLEANUP
    // ========================================

    afterAll(async () => {

        jest.restoreAllMocks();

        /*
         * Remove only the test user's cart.
         * CartItem records are deleted automatically
         * because of onDelete: Cascade.
         */

        await prisma.cart.deleteMany({
            where: {
                userId
            }
        });

        await prisma.$disconnect();

    });

});
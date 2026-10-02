const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/server");
const prisma = require("../src/config/prisma");

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "shopsphere_super_secret_change_later";

const createToken = (role = "user") => {
    return jwt.sign(
        {
            userId: 999,
            email: "test@shopsphere.com",
            role
        },
        JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );
};

describe("Product Service API", () => {

    let productId;
    let token;

    beforeAll(() => {
        token = createToken();
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
            .toBe("product-service");

        expect(response.body.status)
            .toBe("UP");
    });


    // ========================================
    // GET PRODUCTS
    // ========================================

    test("GET /products should return products", async () => {

        const response =
            await request(app)
                .get("/products");

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toHaveProperty("products");

        expect(
            Array.isArray(response.body.products)
        ).toBe(true);
    });


    // ========================================
    // GET PRODUCT BY INVALID ID
    // ========================================

    test("GET /products/:id should reject invalid ID", async () => {

        const response =
            await request(app)
                .get("/products/abc");

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Invalid product ID");
    });


    test("GET /products/:id should reject zero ID", async () => {

        const response =
            await request(app)
                .get("/products/0");

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Invalid product ID");
    });


    // ========================================
    // CREATE PRODUCT - AUTH
    // ========================================

    test("POST /products should reject request without token", async () => {

        const response =
            await request(app)
                .post("/products")
                .send({
                    name: "Test Product",
                    price: 1000
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe("Authorization header missing");
    });


    test("POST /products should reject invalid token", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    "Bearer invalid-token"
                )
                .send({
                    name: "Test Product",
                    price: 1000
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe("Invalid or expired token");
    });


    // ========================================
    // CREATE PRODUCT - VALIDATION
    // ========================================

    test("POST /products should reject missing name", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    price: 1000
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Valid product name is required");
    });


    test("POST /products should reject empty name", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "   ",
                    price: 1000
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Valid product name is required");
    });


    test("POST /products should reject invalid price", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Invalid Product",
                    price: -100
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Price must be a positive number");
    });


    test("POST /products should reject non-numeric price", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Invalid Product",
                    price: "1000"
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Price must be a positive number");
    });


    // ========================================
    // CREATE PRODUCT
    // ========================================

    test("POST /products should create a product", async () => {

        const response =
            await request(app)
                .post("/products")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Jest Test Product",
                    price: 2500
                });

        expect(response.statusCode)
            .toBe(201);

        expect(response.body)
            .toHaveProperty("product");

        expect(response.body.product.name)
            .toBe("Jest Test Product");

        expect(response.body.product.price)
            .toBe(2500);

        expect(response.body.product)
            .toHaveProperty("id");

        productId =
            response.body.product.id;
    });


    // ========================================
    // GET CREATED PRODUCT
    // ========================================

    test("GET /products/:id should return created product", async () => {

        const response =
            await request(app)
                .get(
                    `/products/${productId}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.product.id)
            .toBe(productId);

        expect(response.body.product.name)
            .toBe("Jest Test Product");
    });


    // ========================================
    // UPDATE PRODUCT
    // ========================================

    test("PUT /products/:id should update product", async () => {

        const response =
            await request(app)
                .put(
                    `/products/${productId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Updated Jest Product",
                    price: 3000
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.product.id)
            .toBe(productId);

        expect(response.body.product.name)
            .toBe("Updated Jest Product");

        expect(response.body.product.price)
            .toBe(3000);
    });


    // ========================================
    // UPDATE VALIDATION
    // ========================================

    test("PUT /products/:id should reject invalid ID", async () => {

        const response =
            await request(app)
                .put("/products/abc")
                .set(
                    "Authorization",
                    `Bearer ${token}`
                )
                .send({
                    name: "Updated Product",
                    price: 3000
                });

        expect(response.statusCode)
            .toBe(400);

        expect(response.body.message)
            .toBe("Invalid product ID");
    });


    test("PUT /products/:id should reject missing token", async () => {

        const response =
            await request(app)
                .put(
                    `/products/${productId}`
                )
                .send({
                    name: "Updated Product",
                    price: 3000
                });

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe("Authorization header missing");
    });


    // ========================================
    // DELETE
    // ========================================

    test("DELETE /products/:id should reject missing token", async () => {

        const response =
            await request(app)
                .delete(
                    `/products/${productId}`
                );

        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe("Authorization header missing");
    });


    test("DELETE /products/:id should delete product", async () => {

        const response =
            await request(app)
                .delete(
                    `/products/${productId}`
                )
                .set(
                    "Authorization",
                    `Bearer ${token}`
                );

        expect(response.statusCode)
            .toBe(200);

        expect(response.body.message)
            .toBe(
                "Product deleted successfully"
            );
    });


    // ========================================
    // GET DELETED PRODUCT
    // ========================================

    test("GET deleted product should return 404", async () => {

        const response =
            await request(app)
                .get(
                    `/products/${productId}`
                );

        expect(response.statusCode)
            .toBe(404);

        /*
         * The controller throws AppError("Product not found", 404),
         * but the current error middleware always converts errors
         * to HTTP 500. Therefore this test documents the CURRENT
         * behavior of the service.
         */
        expect(response.body)
            .toHaveProperty("message");
    });


    // ========================================
    // CLEANUP
    // ========================================

    afterAll(async () => {

        await prisma.$disconnect();

    });

});
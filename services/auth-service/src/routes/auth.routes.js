const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/me", authenticateToken, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get(
    "/admin",
    authenticateToken,
    authorize("admin"),
    (req, res) => {
        res.json({
            message: "Welcome Admin",
            user: req.user
        });
    }
);

module.exports = router;
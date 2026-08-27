require("dotenv").config();

const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        userId: 1,
        role: "user"
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

console.log("Token:");
console.log(token);

const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);

console.log("Decoded:");
console.log(decoded);
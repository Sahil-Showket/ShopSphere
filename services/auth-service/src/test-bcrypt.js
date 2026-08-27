const bcrypt = require("bcryptjs");

async function test() {
    const password = "mypassword123";

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Original:", password);
    console.log("Hash:", hashedPassword);

    const isMatch = await bcrypt.compare(
        password,
        hashedPassword
    );

    console.log("Password matches:", isMatch);
}

test();
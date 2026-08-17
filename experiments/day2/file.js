const fs = require("fs")

console.log("A");
fs.readFile("file.txt", (err, data) => console.log("B"))
console.log("C")
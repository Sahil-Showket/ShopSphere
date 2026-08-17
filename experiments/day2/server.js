const http = require("http")

const server = http.createServer((req, res) => {
    if(req.url == "/"){
        res.end("Welcome to ShopSphere")
    }
    else if(req.url == "/products"){
        const products = {
            products : [
                {
                    "id": 1,
                    "name": "Laptop",
                    "price": 75000
                },
                {
                    "id": 2,
                    "name": "Desktop",
                    "price": 150000
                }
            ]
        }
            const JSON_data = JSON.stringify(products)
            res.setHeader("Content-Type", "application/json");
            res.end(JSON_data)

    }
    else if(req.url == "/users"){
        res.end("Users")
    }
    else if(req.url == "/orders"){
        res.end("Orders")
    }
    else if(req.url == "/about"){
        res.end("ShopSphere E-Commerce Platform")
    }
    else{
        res.statusCode = 404
        res.end("Not Found!")
    }
    
})

server.listen(3000, () => {
    console.log("Shopsphere server running on Port 3000");
})
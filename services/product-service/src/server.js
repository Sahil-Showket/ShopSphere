const express = require('express')

const app = express()
app.use(express.json());

const PORT = 3000

const products = {
    products: [
        {
            id: 1,
            name: "Laptop",
            price: 75000
        },
        {
            id: 2,
            name: "Desktop",
            price: 150000
        }
    ]
}

app.get("/", (req, res) => {
    res.send("Welcome to ShopSphere Product Service")
})

app.get("/products", (req, res) => {

    res.json(products)
})

app.get("/products/:id", (req, res) => {
    const id = +req.params.id
    const product = products.products.find((product) => product.id === id)
    if (product) {
        res.json(product)
    }
    else {
        res.statusCode = 404
        res.end("Product not found")
    }
})

app.post("/products", (req, res) => {
    console.log(req.body)
    res.json({
        message: "Product received",
        product: req.body
    })
})

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`)
})
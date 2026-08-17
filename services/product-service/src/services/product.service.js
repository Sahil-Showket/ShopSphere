const products = [
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
];

const getAllProducts = () => {
    return products;
}

const getProductById = (id) => {
    return products.find((product) => {
        product.id === id;
    })
}

module.exports = {
    getAllProducts,
    getProductById
}
import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";

function Products() {

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/products");

            setProducts(
                response.data.products ||
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load products:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load products"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadProducts();

    }, []);

    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h1>
                    Products
                </h1>

                <p>
                    Loading products...
                </p>
            </div>
        );
    }

    if (error) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h1>
                    Products
                </h1>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadProducts}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (products.length === 0) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h1>
                    Products
                </h1>

                <p>
                    No products available.
                </p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "30px"
            }}
        >

            <h1>
                Products
            </h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px"
                }}
            >

                {products.map(
                    (product) => (

                        <div
                            key={product.id}
                            style={{
                                border:
                                    "1px solid #ddd",
                                padding:
                                    "20px"
                            }}
                        >

                            <h2>
                                {product.name}
                            </h2>

                            <p>
                                ₹{product.price}
                            </p>

                            <Link
                                to={`/products/${product.id}`}
                            >
                                View Product
                            </Link>

                        </div>
                    )
                )}

            </div>

        </div>
    );
}

export default Products;
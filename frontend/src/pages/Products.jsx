import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import ProductCard
    from "../components/ProductCard";

const Products = () => {

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadProducts =
            async () => {

                try {

                    const response =
                        await api.get(
                            "/products"
                        );

                    setProducts(
                        response.data.products ||
                        response.data
                    );

                } catch (error) {

                    setError(
                        error.response?.data
                            ?.message ||
                        "Failed to load products"
                    );

                } finally {

                    setLoading(false);
                }
            };

        loadProducts();

    }, []);

    if (loading) {

        return (
            <p>
                Loading products...
            </p>
        );
    }

    if (error) {

        return (
            <p>
                {error}
            </p>
        );
    }

    return (
        <div>

            <h1>
                Products
            </h1>

            {products.length === 0 ? (

                <p>
                    No products found.
                </p>

            ) : (

                products.map(
                    (product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    )
                )

            )}

        </div>
    );
};

export default Products;
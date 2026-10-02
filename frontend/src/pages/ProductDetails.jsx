import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import api from "../services/api";

const ProductDetails = () => {

    const {
        id
    } = useParams();

    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadProduct =
            async () => {

                try {

                    const response =
                        await api.get(
                            `/products/${id}`
                        );

                    setProduct(
                        response.data.product ||
                        response.data
                    );

                } catch (error) {

                    setError(
                        error.response?.data
                            ?.message ||
                        "Product not found"
                    );

                } finally {

                    setLoading(false);
                }
            };

        loadProduct();

    }, [id]);

    if (loading) {

        return (
            <p>
                Loading...
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
                {product.name}
            </h1>

            <h2>
                ₹{product.price}
            </h2>

            <p>
                Product ID:
                {" "}
                {product.id}
            </p>

        </div>
    );
};

export default ProductDetails;
import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import api from "../services/api";

import {
    useAuth
} from "../context/AuthContext";

import {
    useCart
} from "../context/CartContext";

const ProductDetails = () => {

    const {
        id
    } = useParams();

    const {
        user
    } = useAuth();

    const {
        addToCart
    } = useCart();

    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [quantity, setQuantity] =
        useState(1);

    const [adding, setAdding] =
        useState(false);

    const [cartMessage, setCartMessage] =
        useState("");

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

    useEffect(() => {

        loadProduct();

    }, [id]);

    const handleAddToCart =
        async () => {

            if (!user) {

                setCartMessage(
                    "Please login to add products to cart."
                );

                return;
            }

            try {

                setAdding(true);
                setCartMessage("");

                await addToCart(
                    product.id,
                    quantity
                );

                setCartMessage(
                    "Product added to cart successfully."
                );

            } catch (error) {

                setCartMessage(
                    error.response?.data
                        ?.message ||
                    "Failed to add product to cart."
                );

            } finally {

                setAdding(false);
            }
        };

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

            {user ? (
                <div>

                    <label>
                        Quantity:
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(event) => {

                            const value =
                                Number(
                                    event.target.value
                                );

                            if (value >= 1) {
                                setQuantity(value);
                            }

                        }}
                    />

                    <button
                        onClick={
                            handleAddToCart
                        }
                        disabled={adding}
                    >
                        {adding
                            ? "Adding..."
                            : "Add to Cart"}
                    </button>

                </div>
            ) : (
                <p>
                    Please login to add this
                    product to your cart.
                </p>
            )}

            {cartMessage && (
                <p>
                    {cartMessage}
                </p>
            )}

        </div>
    );
};

export default ProductDetails;
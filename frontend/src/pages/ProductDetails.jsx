import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import api from "../services/api";

import {
    useAuth
} from "../context/AuthContext";

import {
    useCart
} from "../context/CartContext";

function ProductDetails() {

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

    const loadProduct = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get(
                    `/products/${id}`
                );

            setProduct(
                response.data.product ||
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load product:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Product not found"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadProduct();

    }, [id]);

    const handleQuantityChange = (
        event
    ) => {

        const value =
            Number(event.target.value);

        if (
            Number.isInteger(value) &&
            value >= 1
        ) {

            setQuantity(value);
        }
    };

    const handleAddToCart = async () => {

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
                error.response?.data?.message ||
                "Failed to add product to cart."
            );

        } finally {

            setAdding(false);
        }
    };

    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <p>
                    Loading product...
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
                <p>
                    {error}
                </p>

                <Link to="/products">
                    Back to Products
                </Link>
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
                {product.name}
            </h1>

            <h2>
                ₹{product.price}
            </h2>

            <p>
                Product ID: {product.id}
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
                        onChange={
                            handleQuantityChange
                        }
                        style={{
                            marginLeft: "10px",
                            width: "70px"
                        }}
                    />

                    <button
                        onClick={
                            handleAddToCart
                        }
                        disabled={adding}
                        style={{
                            marginLeft: "10px"
                        }}
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

            <br />

            <Link to="/products">
                Back to Products
            </Link>

        </div>
    );
}

export default ProductDetails;
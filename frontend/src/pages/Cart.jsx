import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useCart
} from "../context/CartContext";

import api from "../services/api";

function Cart() {

    const {
        cart,
        loading,
        error,
        fetchCart
    } = useCart();

    const navigate =
        useNavigate();

    const [placingOrder, setPlacingOrder] =
        useState(false);

    const [orderError, setOrderError] =
        useState("");

    const updateQuantity = async (
        productId,
        quantity
    ) => {

        try {

            await api.patch(
                `/cart/items/${productId}`,
                {
                    quantity
                }
            );

            await fetchCart();

        } catch (error) {

            console.error(
                "Failed to update quantity:",
                error
            );

        }
    };

    const removeItem = async (
        productId
    ) => {

        try {

            await api.delete(
                `/cart/items/${productId}`
            );

            await fetchCart();

        } catch (error) {

            console.error(
                "Failed to remove item:",
                error
            );

        }
    };

    const placeOrder = async () => {

        try {

            setPlacingOrder(true);
            setOrderError("");

            const response =
                await api.post(
                    "/orders"
                );

            const order =
                response.data.order ||
                response.data;

            await fetchCart();

            navigate(
                `/orders/${order.id}`
            );

        } catch (error) {

            console.error(
                "Failed to place order:",
                error
            );

            setOrderError(
                error.response?.data?.message ||
                "Failed to place order"
            );

        } finally {

            setPlacingOrder(false);
        }
    };

    if (loading) {

        return (
            <div>
                <h1>Shopping Cart</h1>
                <p>Loading cart...</p>
            </div>
        );
    }

    if (error) {

        return (
            <div>
                <h1>Shopping Cart</h1>
                <p>{error}</p>
            </div>
        );
    }

    if (
        !cart ||
        !cart.items ||
        cart.items.length === 0
    ) {

        return (
            <div>

                <h1>
                    Shopping Cart
                </h1>

                <p>
                    Your cart is empty.
                </p>

                <Link to="/products">
                    Continue Shopping
                </Link>

            </div>
        );
    }

    return (
        <div>

            <h1>
                Shopping Cart
            </h1>

            {cart.items.map(
                (item) => (

                    <div
                        key={item.id}
                        style={{
                            border:
                                "1px solid #ddd",
                            padding: "16px",
                            marginBottom:
                                "12px"
                        }}
                    >

                        <h3>
                            Product ID:{" "}
                            {item.productId}
                        </h3>

                        <p>
                            Quantity:
                        </p>

                        <button
                            onClick={() =>
                                updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                )
                            }
                            disabled={
                                item.quantity <= 1
                            }
                        >
                            -
                        </button>

                        <span
                            style={{
                                margin: "0 15px"
                            }}
                        >
                            {item.quantity}
                        </span>

                        <button
                            onClick={() =>
                                updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                )
                            }
                        >
                            +
                        </button>

                        <br />

                        <button
                            onClick={() =>
                                removeItem(
                                    item.productId
                                )
                            }
                            style={{
                                marginTop: "12px"
                            }}
                        >
                            Remove
                        </button>

                    </div>
                )
            )}

            <hr />

            {orderError && (

                <p>
                    {orderError}
                </p>
            )}

            <button
                onClick={placeOrder}
                disabled={placingOrder}
            >
                {placingOrder
                    ? "Placing Order..."
                    : "Place Order"}
            </button>

        </div>
    );
}

export default Cart;
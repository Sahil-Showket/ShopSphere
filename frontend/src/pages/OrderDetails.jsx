import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useParams
} from "react-router-dom";

import api from "../services/api";

function OrderDetails() {

    const {
        id
    } = useParams();

    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [paying, setPaying] =
        useState(false);

    const [paymentMessage, setPaymentMessage] =
        useState("");

    const loadOrder = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get(
                    `/orders/${id}`
                );

            setOrder(
                response.data.order ||
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load order:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Order not found"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadOrder();

    }, [id]);

    const handlePayment = async () => {

        try {

            setPaying(true);
            setPaymentMessage("");

            const response =
                await api.post(
                    "/payments",
                    {
                        orderId: Number(id)
                    }
                );

            setPaymentMessage(
                response.data.message ||
                "Payment successful"
            );

            await loadOrder();

        } catch (error) {

            console.error(
                "Payment failed:",
                error
            );

            setPaymentMessage(
                error.response?.data?.message ||
                "Payment failed"
            );

        } finally {

            setPaying(false);
        }
    };

    if (loading) {

        return (
            <div>
                <h1>
                    Order Details
                </h1>

                <p>
                    Loading...
                </p>
            </div>
        );
    }

    if (error) {

        return (
            <div>

                <h1>
                    Order Details
                </h1>

                <p>
                    {error}
                </p>

                <Link to="/orders">
                    Back to Orders
                </Link>

            </div>
        );
    }

    return (
        <div>

            <h1>
                Order #{order.id}
            </h1>

            <p>
                Status:{" "}
                <strong>
                    {order.status}
                </strong>
            </p>

            <p>
                Total: ₹{order.total}
            </p>

            {order.items &&
                order.items.length > 0 && (

                    <div>

                        <h2>
                            Items
                        </h2>

                        {order.items.map(
                            (item) => (

                                <div
                                    key={item.id}
                                    style={{
                                        border:
                                            "1px solid #ddd",
                                        padding:
                                            "12px",
                                        marginBottom:
                                            "10px"
                                    }}
                                >

                                    <p>
                                        Product ID:{" "}
                                        {
                                            item.productId
                                        }
                                    </p>

                                    <p>
                                        Quantity:{" "}
                                        {
                                            item.quantity
                                        }
                                    </p>

                                    <p>
                                        Price: ₹
                                        {
                                            item.price
                                        }
                                    </p>

                                </div>
                            )
                        )}

                    </div>
                )}

            {order.status === "PENDING" && (

                <div>

                    <button
                        onClick={
                            handlePayment
                        }
                        disabled={paying}
                    >
                        {paying
                            ? "Processing Payment..."
                            : "Pay Now"}
                    </button>

                </div>
            )}

            {paymentMessage && (

                <p>
                    {paymentMessage}
                </p>
            )}

            <br />

            <Link to="/orders">
                Back to Orders
            </Link>

        </div>
    );
}

export default OrderDetails;
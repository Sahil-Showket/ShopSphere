import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";

function Orders() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/orders");

            setOrders(
                response.data.orders ||
                response.data
            );

        } catch (error) {

            console.error(
                "Failed to load orders:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load orders"
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadOrders();

    }, []);

    if (loading) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >
                <h1>
                    My Orders
                </h1>

                <p>
                    Loading orders...
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
                    My Orders
                </h1>

                <p>
                    {error}
                </p>

                <button
                    onClick={loadOrders}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (orders.length === 0) {

        return (
            <div
                style={{
                    padding: "30px"
                }}
            >

                <h1>
                    My Orders
                </h1>

                <p>
                    You have no orders yet.
                </p>

                <Link to="/products">
                    Continue Shopping
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
                My Orders
            </h1>

            {orders.map(
                (order) => (

                    <div
                        key={order.id}
                        style={{
                            border:
                                "1px solid #ddd",
                            padding:
                                "20px",
                            marginBottom:
                                "15px"
                        }}
                    >

                        <h3>
                            Order #{order.id}
                        </h3>

                        <p>
                            Status:{" "}
                            <strong>
                                {order.status}
                            </strong>
                        </p>

                        <p>
                            Total: ₹{order.total}
                        </p>

                        <p>
                            Created:{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleString()}
                        </p>

                        <Link
                            to={`/orders/${order.id}`}
                        >
                            View Order
                        </Link>

                    </div>
                )
            )}

        </div>
    );
}

export default Orders;
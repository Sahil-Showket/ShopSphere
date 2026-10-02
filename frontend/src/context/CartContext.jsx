import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

import {
    useAuth
} from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

    const {
        token
    } = useAuth();

    const [cart, setCart] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const fetchCart = async () => {

        if (!token) {
            setCart(null);
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/cart");

            setCart(response.data);

        } catch (error) {

            console.error(
                "Failed to fetch cart:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load cart"
            );

        } finally {

            setLoading(false);
        }
    };

    const addToCart = async (
        productId,
        quantity = 1
    ) => {

        try {

            setError("");

            const response =
                await api.post(
                    "/cart/items",
                    {
                        productId,
                        quantity
                    }
                );

            await fetchCart();

            return response.data;

        } catch (error) {

            console.error(
                "Failed to add product:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to add product to cart"
            );

            throw error;
        }
    };

    useEffect(() => {

        if (token) {
            fetchCart();
        } else {
            setCart(null);
        }

    }, [token]);

    const cartItemCount =
        cart?.items?.reduce(
            (total, item) =>
                total + item.quantity,
            0
        ) || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                fetchCart,
                addToCart,
                cartItemCount
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () =>
    useContext(CartContext);
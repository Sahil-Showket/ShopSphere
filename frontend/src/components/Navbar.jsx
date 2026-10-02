import {
    Link
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

import {
    useCart
} from "../context/CartContext";

function Navbar() {

    const {
        user,
        logout
    } = useAuth();

    const {
        cartItemCount
    } = useCart();

    return (
        <nav
            style={{
                padding: "15px",
                borderBottom:
                    "1px solid #ddd",
                display: "flex",
                gap: "20px",
                alignItems: "center"
            }}
        >

            <Link to="/">
                ShopSphere
            </Link>

            <Link to="/products">
                Products
            </Link>

            {user && (
                <>
                    <Link to="/cart">
                        Cart ({cartItemCount})
                    </Link>

                    <Link to="/orders">
                        Orders
                    </Link>

                    <Link to="/account">
                        Account
                    </Link>

                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>
                </>
            )}

            {!user && (
                <>
                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>
                </>
            )}

        </nav>
    );
}

export default Navbar;
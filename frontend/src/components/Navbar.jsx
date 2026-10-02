import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";

const Navbar = () => {

    const {
        token,
        user,
        logout
    } = useAuth();

    const navigate =
        useNavigate();

    const handleLogout = () => {

        logout();

        navigate(
            "/login"
        );
    };

    return (
        <nav>

            <Link to="/">
                ShopSphere
            </Link>

            {" | "}

            <Link to="/products">
                Products
            </Link>

            {" | "}

            {token ? (

                <>
                    <span>
                        Welcome{" "}
                        {user?.email}
                    </span>

                    {" "}

                    <button
                        onClick={
                            handleLogout
                        }
                    >
                        Logout
                    </button>
                </>

            ) : (

                <>
                    <Link to="/login">
                        Login
                    </Link>

                    {" | "}

                    <Link to="/register">
                        Register
                    </Link>
                </>

            )}

        </nav>
    );
};

export default Navbar;
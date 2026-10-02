import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import {
    useAuth
} from "../context/AuthContext";

const Login = () => {

    const navigate =
        useNavigate();

    const {
        login
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setLoading(true);

            try {

                const response =
                    await api.post(
                        "/auth/login",
                        {
                            email,
                            password
                        }
                    );

                const {
                    token,
                    user
                } = response.data;

                login(
                    token,
                    user
                );

                navigate(
                    "/products"
                );

            } catch (error) {

                setError(
                    error.response?.data
                        ?.message ||
                    "Login failed"
                );

            } finally {

                setLoading(false);
            }
        };

    return (
        <div>

            <h1>
                Login
            </h1>

            <form
                onSubmit={
                    handleSubmit
                }
            >

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) =>
                        setEmail(
                            event.target.value
                        )
                    }
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                        setPassword(
                            event.target.value
                        )
                    }
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>

            </form>

            {error && (
                <p>
                    {error}
                </p>
            )}

        </div>
    );
};

export default Login;
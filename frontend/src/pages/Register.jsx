import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

const Register = () => {

    const navigate =
        useNavigate();

    const [name, setName] =
        useState("");

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

                await api.post(
                    "/auth/register",
                    {
                        name,
                        email,
                        password
                    }
                );

                navigate(
                    "/login"
                );

            } catch (error) {

                setError(
                    error.response?.data
                        ?.message ||
                    "Registration failed"
                );

            } finally {

                setLoading(false);
            }
        };

    return (
        <div>

            <h1>
                Create Account
            </h1>

            <form
                onSubmit={
                    handleSubmit
                }
            >

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(event) =>
                        setName(
                            event.target.value
                        )
                    }
                    required
                />

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
                        ? "Creating..."
                        : "Register"}
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

export default Register;
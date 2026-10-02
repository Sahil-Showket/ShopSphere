import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext =
    createContext();

export const AuthProvider = ({
    children
}) => {

    const [token, setToken] =
        useState(
            localStorage.getItem(
                "token"
            )
        );

    const [user, setUser] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const login = (
        newToken,
        userData
    ) => {

        localStorage.setItem(
            "token",
            newToken
        );

        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        setToken(null);
        setUser(null);
    };

    useEffect(() => {

        const loadUser = async () => {

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const response =
                    await api.get(
                        "/auth/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setUser(
                    response.data.user
                );

            } catch (error) {

                console.error(
                    "Failed to load user:",
                    error
                );

                logout();

            } finally {

                setLoading(false);
            }
        };

        loadUser();

    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>
    useContext(AuthContext);
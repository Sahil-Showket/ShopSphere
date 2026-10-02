import {
    Routes,
    Route
} from "react-router-dom";

import Home
    from "./pages/Home";

import Login
    from "./pages/Login";

import Register
    from "./pages/Register";

import Products
    from "./pages/Products";

import ProductDetails
    from "./pages/ProductDetails";

import Navbar
    from "./components/Navbar";

import ProtectedRoute
    from "./routes/ProtectedRoute";

function App() {

    return (
        <>
            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={
                        <Home />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />

                <Route
                    path="/products"
                    element={
                        <Products />
                    }
                />

                <Route
                    path="/products/:id"
                    element={
                        <ProductDetails />
                    }
                />

                <Route
                    path="/account"
                    element={
                        <ProtectedRoute>
                            <h1>
                                My Account
                            </h1>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </>
    );
}

export default App;
import { useEffect } from "react";

import api from "../services/api";

const Home = () => {

    useEffect(() => {

        const testGateway = async () => {

            try {

                const response =
                    await api.get(
                        "/products"
                    );

                console.log(
                    "Products:",
                    response.data
                );

            } catch (error) {

                console.error(
                    "Gateway request failed:",
                    error
                );

            }

        };

        testGateway();

    }, []);

    return (
        <div>
            <h1>ShopSphere</h1>

            <p>
                Frontend connected to API Gateway.
            </p>
        </div>
    );
};

export default Home;
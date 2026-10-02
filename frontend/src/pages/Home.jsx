import {
    Link
} from "react-router-dom";

function Home() {

    return (
        <div
            style={{
                padding: "50px",
                textAlign: "center"
            }}
        >

            <h1>
                Welcome to ShopSphere
            </h1>

            <p>
                Your distributed e-commerce
                platform.
            </p>

            <p>
                Shop products, manage your cart,
                place orders and make payments.
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "center",
                    gap: "15px",
                    marginTop: "25px"
                }}
            >

                <Link to="/products">
                    <button>
                        Browse Products
                    </button>
                </Link>

                <Link to="/orders">
                    <button>
                        My Orders
                    </button>
                </Link>

            </div>

        </div>
    );
}

export default Home;
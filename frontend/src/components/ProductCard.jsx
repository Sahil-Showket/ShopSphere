import {
    Link
} from "react-router-dom";

const ProductCard = ({
    product
}) => {

    return (
        <div>

            <h2>
                {product.name}
            </h2>

            <p>
                ₹{product.price}
            </p>

            <Link
                to={`/products/${product.id}`}
            >
                View Product
            </Link>

        </div>
    );
};

export default ProductCard;
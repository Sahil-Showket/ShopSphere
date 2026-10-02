const amqp = require("amqplib");

const RABBITMQ_URL =
    process.env.RABBITMQ_URL ||
    "amqp://localhost:5672";

let connection;
let channel;

const connectRabbitMQ = async () => {

    try {

        connection =
            await amqp.connect(
                RABBITMQ_URL
            );

        channel =
            await connection.createChannel();

        await channel.assertExchange(
            "shopsphere.events",
            "topic",
            {
                durable: true
            }
        );

        connection.on(
            "error",
            (error) => {
                console.error(
                    "RabbitMQ connection error:",
                    error.message
                );
            }
        );

        connection.on(
            "close",
            () => {

                console.error(
                    "RabbitMQ connection closed"
                );

                connection = null;
                channel = null;
            }
        );

        channel.on(
            "error",
            (error) => {
                console.error(
                    "RabbitMQ channel error:",
                    error.message
                );
            }
        );

        console.log(
            "Order Service connected to RabbitMQ"
        );

        return channel;

    } catch (error) {

        console.error(
            "Failed to connect to RabbitMQ:",
            error.message
        );

        throw error;
    }
};

const getChannel = () => {

    if (!channel) {

        throw new Error(
            "RabbitMQ channel not initialized"
        );
    }

    return channel;
};

module.exports = {
    connectRabbitMQ,
    getChannel
};
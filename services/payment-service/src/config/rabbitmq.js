const amqp = require("amqplib");

const RABBITMQ_URL =
    process.env.RABBITMQ_URL ||
    "amqp://localhost:5672";

let connection;
let channel;

const connectRabbitMQ = async () => {
    connection =
        await amqp.connect(RABBITMQ_URL);

    channel =
        await connection.createChannel();

    await channel.assertExchange(
        "shopsphere.events",
        "topic",
        {
            durable: true
        }
    );

    console.log(
        "Payment Service connected to RabbitMQ"
    );

    return channel;
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
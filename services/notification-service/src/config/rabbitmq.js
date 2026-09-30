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

    const queue =
        await channel.assertQueue(
            "notification-service",
            {
                durable: true
            }
        );

    await channel.bindQueue(
        queue.queue,
        "shopsphere.events",
        "payment.success"
    );

    console.log(
        "Notification Service connected to RabbitMQ"
    );

    channel.consume(
        queue.queue,
        async (message) => {

            if (!message) {
                return;
            }

            try {

                const event =
                    JSON.parse(
                        message.content.toString()
                    );

                console.log(
                    "Received event:",
                    event
                );

                await handleEvent(event);

                channel.ack(message);

            } catch (error) {

                console.error(
                    "Error processing event:",
                    error
                );

                channel.nack(
                    message,
                    false,
                    false
                );
            }
        }
    );
};

const handleEvent = async (event) => {

    if (
        event.eventType ===
        "payment.success"
    ) {

        const {
            userId,
            orderId,
            amount,
            transactionId
        } = event.data;

        console.log(
            "Payment successful notification:"
        );

        console.log(
            `User: ${userId}`
        );

        console.log(
            `Order: ${orderId}`
        );

        console.log(
            `Amount: ${amount}`
        );

        console.log(
            `Transaction: ${transactionId}`
        );
    }
};

module.exports = {
    connectRabbitMQ
};
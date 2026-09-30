const amqp = require("amqplib");

const {
    handleEvent
} = require("../services/event-handler.service");

const RABBITMQ_URL =
    process.env.RABBITMQ_URL ||
    "amqp://localhost:5672";

const EVENT_EXCHANGE =
    "shopsphere.events";

const DLX_EXCHANGE =
    "shopsphere.dlx";

const EVENT_QUEUE =
    "notification-service";

const DLQ_QUEUE =
    "notification-service.dlq";

const isRabbitMQConnected = () => {
    return Boolean(channel);
};

let connection;
let channel;


const connectRabbitMQ = async () => {

    connection =
        await amqp.connect(
            RABBITMQ_URL
        );

    channel =
        await connection.createChannel();


    /*
     * Main event exchange
     */
    await channel.assertExchange(
        EVENT_EXCHANGE,
        "topic",
        {
            durable: true
        }
    );


    /*
     * Dead-letter exchange
     */
    await channel.assertExchange(
        DLX_EXCHANGE,
        "direct",
        {
            durable: true
        }
    );


    /*
     * Dead-letter queue
     */
    await channel.assertQueue(
        DLQ_QUEUE,
        {
            durable: true
        }
    );


    await channel.bindQueue(
        DLQ_QUEUE,
        DLX_EXCHANGE,
        "notification-service"
    );


    /*
     * Main notification queue
     */
    await channel.assertQueue(
        EVENT_QUEUE,
        {
            durable: true,
            deadLetterExchange:
                DLX_EXCHANGE,
            deadLetterRoutingKey:
                "notification-service"
        }
    );


    /*
     * Event bindings
     */
    await channel.bindQueue(
        EVENT_QUEUE,
        EVENT_EXCHANGE,
        "payment.success"
    );


    await channel.bindQueue(
        EVENT_QUEUE,
        EVENT_EXCHANGE,
        "order.confirmed"
    );


    /*
     * Prevent consumer from receiving
     * too many messages at once.
     */
    channel.prefetch(1);


    console.log(
        "Notification Service connected to RabbitMQ"
    );


    /*
     * Start consumer
     */
    channel.consume(
        EVENT_QUEUE,
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
                    `Processing event: ${event.eventType}`
                );


                await handleEvent(event);


                /*
                 * Processing successful
                 */
                channel.ack(message);


                console.log(
                    `Event processed: ${event.eventType}`
                );

            } catch (error) {

                console.error(
                    "Event processing failed:",
                    error.message
                );


                /*
                 * Send failed message
                 * to Dead Letter Queue.
                 */
                channel.nack(
                    message,
                    false,
                    false
                );
            }
        }
    );


    /*
     * Graceful shutdown
     */
    const shutdown = async () => {

        console.log(
            "Closing RabbitMQ connection..."
        );

        try {

            await channel.close();
            await connection.close();

        } catch (error) {

            console.error(
                "RabbitMQ shutdown error:",
                error.message
            );
        }

        process.exit(0);
    };


    process.on(
        "SIGINT",
        shutdown
    );

    process.on(
        "SIGTERM",
        shutdown
    );
};


module.exports = {
    connectRabbitMQ,
    isRabbitMQConnected
};
const {
    getChannel
} = require("../config/rabbitmq");


const publishEvent = async (
    eventType,
    data
) => {

    const channel =
        getChannel();


    const event = {
        eventType,
        data,
        timestamp:
            new Date().toISOString()
    };


    channel.publish(
        "shopsphere.events",
        eventType,
        Buffer.from(
            JSON.stringify(event)
        ),
        {
            persistent: true
        }
    );


    console.log(
        `Published event: ${eventType}`
    );
};


module.exports = {
    publishEvent
};
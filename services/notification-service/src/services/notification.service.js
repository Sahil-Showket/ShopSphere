const sendNotification = async ({
    type,
    title,
    message
}) => {

    console.log("================================");
    console.log("MOCK NOTIFICATION");
    console.log("Type:", type);
    console.log("Title:", title);
    console.log("Message:", message);
    console.log("================================");

    return {
        success: true
    };
};

module.exports = {
    sendNotification
};
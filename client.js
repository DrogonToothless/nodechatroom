const net = require('net');
const client = net.createConnection({port: 3000}, () => {
    console.log("Connected to server");
});
client.on("data", (data) => {
    console.log("Message from server:" + data.toString());
    client.end();
});
client.on("end", () => {
    console.log("End of message");
});
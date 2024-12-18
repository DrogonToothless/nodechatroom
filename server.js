const net = require('net');
const server = net.createServer((socket) => {
    console.log("Welcome to the server");
    socket.on("data", (chunk) => {
        socket.write(chunk);
    });
    socket.on("end", socket.end);
});
server.listen(3000, () => {
    console.log("Server is up")
})
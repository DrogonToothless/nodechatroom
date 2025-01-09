const net = require('net');
const fs = require('fs');
const clients = [];
const server = net.createServer((socket) => {
    console.log('A new client connected');
    clients.push(socket);
    clients.forEach((client) => {
        if (client !== socket) {
            client.write('A new client has connected\n');
        }
        console.log("Client list:" + clients)
    });
    socket.on('data', (data) => {
        console.log('Message from client:', data.toString().trim());
        clients.forEach((client) => {
            if (client !== socket) {
                client.write(data);
            }
        });
    });
    socket.on('end', () => {
        console.log('A client disconnected');
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        clients.forEach((client) => {
            client.write('A client has disconnected\n');
        });
        console.log("Client list:" + clients)
    });
    socket.on('error', (err) => {
        console.log('Socket error:', err.message);
    });
});
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
    console.log("Client list:" + clients);
});

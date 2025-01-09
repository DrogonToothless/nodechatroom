const net = require('net');
const fs = require('fs');
const logStream = fs.createWriteStream('server.log', { flags: 'a' });
const clients = [];
let clientId = 1;
const server = net.createServer((socket) => {
    const clientName = `Client${clientId++}`;
    console.log(`${clientName} connected`);
    logStream.write(`${clientName} connected\n`);
    clients.push({ socket, name: clientName });
    clients.forEach((client) => {
        if (client.socket !== socket) {
            try {
                client.socket.write(`[SYSTEM] ${clientName} has joined the chat\n`);
            } catch (err) {
                console.error(`Error broadcasting join message: ${err.message}`);
            }
        }
    });
    socket.on('data', (data) => {
        const message = `${clientName}: ${data.toString().trim()}`;
        console.log(message);
        logStream.write(message + '\n');
        clients.forEach((client) => {
            if (client.socket !== socket) {
                try {
                    client.socket.write(message + '\n');
                } catch (err) {
                    console.error(`Error broadcasting message: ${err.message}`);
                }
            }
        });
    });
    socket.on('end', () => {
        console.log(`${clientName} disconnected`);
        logStream.write(`${clientName} disconnected\n`);
        const index = clients.findIndex((client) => client.socket === socket);
        if (index !== -1) clients.splice(index, 1);
        clients.forEach((client) => {
            try {
                client.socket.write(`[SYSTEM] ${clientName} has left the chat\n`);
            } catch (err) {
                console.error(`Error broadcasting leave message: ${err.message}`);
            }
        });
    });
    socket.on('error', (err) => {
        console.error(`Error with ${clientName}: ${err.message}`);
        logStream.write(`Error with ${clientName}: ${err.message}\n`);
    });
});
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    logStream.write('Server shutting down...\n');
    logStream.end(() => {
        process.exit();
    });
});
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
    logStream.write('Server started on port 3000\n');
});
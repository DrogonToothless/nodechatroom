const net = require('net');
const clients = [];
const client = net.createConnection({ port: 3000 }, () => {
    console.log('Connected to server');
});
client.on('connect', () => {
    console.log('Connection established. Start chatting!');
});
client.on('data', (data) => {
    console.log('Server:', data.toString().trim());
});
client.on('end', () => {
    console.log('Disconnected from server');
    process.exit(0);
});
client.on('error', (err) => {
    console.error('Connection error:', err.message);
});
const userInput = process.stdin;
userInput.setEncoding('utf-8');
userInput.on('data', (data) => {
    const message = data.trim();
    if (message.toLowerCase() === 'exit') {
        console.log('Exiting...');
        client.end();
    } else {
        client.write(message);
    }
});
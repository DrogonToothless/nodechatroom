const net = require('net');
const fs = require('fs');
const client = net.createConnection({ port: 3000 }, () => {
    console.log('Connected to server');
});
client.on('connect', () => {
    
});
client.on('data', (data) => {
    console.log(data.toString().trim());
});
client.on('end', () => {
    console.log('Disconnected from server');
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
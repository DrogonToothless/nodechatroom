const net = require('net');
const args = process.argv.slice(2);
const command = args[0];
const target = args[1];
const whisperMessage = args.slice(2).join(' ');
const client = net.createConnection({ port: 3000 }, () => {
    console.log('Connected to server');
});
client.on('connect', () => {
    console.log('Connection established. Start chatting!');
    if (command === '/w' && target && whisperMessage) {
        client.write(`/w ${target} ${whisperMessage}`);
        console.log(`Whisper to ${target}: ${whisperMessage}`);
    }
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
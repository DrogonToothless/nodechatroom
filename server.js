const net = require('net');
const fs = require('fs');
const clients = {};
const adminPassword = 'supersecretpw';
const logFile = 'server.log';
function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err.message);
        }
    });
}
const server = net.createServer((socket) => {
    let username = `Guest${Object.keys(clients).length + 1}`;
    clients[username] = socket;
    logMessage(`${username} connected`);
    broadcast(`${username} has joined the chat`);
    console.log(`${username} connected`);
    socket.on('data', (data) => {
        const message = data.toString().trim();
        if (message.startsWith('/w ')) {
            const [, target, ...msgParts] = message.split(' ');
            const privateMessage = msgParts.join(' ');
            if (clients[target]) {
                clients[target].write(`[Whisper from ${username}]: ${privateMessage}`);
                socket.write(`[Whisper to ${target}]: ${privateMessage}`);
                logMessage(`${username} whispered to ${target}: ${privateMessage}`);
            } else {
                socket.write(`Error: User ${target} not found.`);
                logMessage(`${username} failed to whisper to ${target}: User not found.`);
            }
        } else if (message.startsWith('/username ')) {
            const [, newUsername] = message.split(' ');
            if (!newUsername) {
                socket.write('Error: Username cannot be empty.');
                logMessage(`${username} failed to update their username: Empty username.`);
            } else if (clients[newUsername]) {
                socket.write('Error: Username is already in use.');
                logMessage(`${username} failed to update their username: Username already in use.`);
            } else {
                const oldUsername = username;
                delete clients[username];
                username = newUsername;
                clients[username] = socket;
                broadcast(`${oldUsername} has changed their name to ${username}`);
                socket.write(`Your username has been updated to ${username}.`);
                logMessage(`${oldUsername} changed their username to ${username}`);
            }
        } else if (message.startsWith('/kick ')) {
            const [, target, password] = message.split(' ');
            if (password !== adminPassword) {
                socket.write('Error: Incorrect admin password.');
                logMessage(`${username} failed to kick ${target}: Incorrect admin password.`);
            } else if (clients[target]) {
                clients[target].write('You have been kicked from the server.');
                clients[target].destroy();
                delete clients[target];
                broadcast(`${target} has been kicked from the server.`);
                logMessage(`${username} kicked ${target} from the server.`);
            } else {
                socket.write(`Error: User ${target} not found.`);
                logMessage(`${username} failed to kick ${target}: User not found.`);
            }
        } else if (message === '/clientlist') {
            const clientList = Object.keys(clients).join(', ');
            socket.write(`Connected clients: ${clientList}`);
            logMessage(`${username} requested the client list.`);
        } else {
            broadcast(`${username}: ${message}`, socket);
            logMessage(`${username}: ${message}`);
        }
    });
    socket.on('end', () => {
        delete clients[username];
        broadcast(`${username} has left the chat`);
        logMessage(`${username} disconnected`);
    });
    socket.on('error', (err) => {
        console.error(`Error with ${username}: ${err.message}`);
        logMessage(`Error with ${username}: ${err.message}`);
    });
});
function broadcast(message, senderSocket = null) {
    Object.values(clients).forEach((clientSocket) => {
        if (clientSocket !== senderSocket) {
            clientSocket.write(message);
        }
    });
    logMessage(`Broadcast: ${message}`);
}
server.listen(3000, () => {
    console.log('Server is listening on port 3000');
    logMessage('Server started listening on port 3000');
});
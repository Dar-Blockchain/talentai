/**
 * Connects to the Socket.IO server, emits a single sendSystemNotification,
 * waits for an ack, then exits.
 * Usage: node examples/ws-send-once.js <serverUrl> <recipient> <content>
 */
const { io } = require('socket.io-client');

const serverUrl = process.argv[2] || 'http://localhost:3000';
const recipient = process.argv[3] || 'test-user';
const content = process.argv[4] || 'Test notification from ws-send-once';

console.log(`Connecting to ${serverUrl} and sending to ${recipient} ...`);

// Try polling first (more compatible) then allow websocket
const socket = io(serverUrl, { transports: ['polling', 'websocket'], upgrade: true });

let done = false;

socket.on('connect', () => {
  console.log('Connected, socket id:', socket.id);
  socket.emit('join', recipient);
  socket.emit('sendSystemNotification', { recipient, content });
});

socket.on('notificationCreated', (notif) => {
  console.log('Notification created ack:', notif && notif._id ? notif._id : notif);
  done = true;
  socket.close();
  process.exit(0);
});

socket.on('notificationError', (err) => {
  console.error('Notification error:', err);
  done = true;
  socket.close();
  process.exit(1);
});

socket.on('connect_error', (err) => {
  console.error('Connect error:', err.message || err);
});

setTimeout(() => {
  if (!done) {
    console.error('Timeout waiting for ack, exiting');
    socket.close();
    process.exit(2);
  }
}, 10000);

#!/usr/bin/env node
/**
 * Example WebSocket client for the TalentAI notification system
 * Usage (Node):
 *   npm install socket.io-client
 *   node Backend/examples/ws-client.js <serverUrl> <userId>
 * Example:
 *   node Backend/examples/ws-client.js http://localhost:3000 user123
 *
 * This script demonstrates:
 *  - connecting to the Socket.IO server
 *  - joining a user's room
 *  - listening for `notification` events
 *  - sending `sendSystemNotification` and `broadcastSystemNotification`
 *
 */

const { io } = require('socket.io-client');
const readline = require('readline');

const serverUrl = process.argv[2] || 'http://localhost:3000';
const userId = process.argv[3] || 'test-user';

console.log(`Connecting to ${serverUrl} as user '${userId}'...`);

const socket = io(serverUrl, {
  transports: ['websocket', 'polling'],
  reconnection: true,
});

socket.on('connect', () => {
  console.log('Connected to server, socket id:', socket.id);
  socket.emit('join', userId);
  console.log('Joined room for user:', userId);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message || err);
});

socket.on('notification', (notif) => {
  console.log('\n⬇️  Notification received:');
  console.log(JSON.stringify(notif, null, 2));
});

socket.on('notificationCreated', (notif) => {
  console.log('\n✅ Notification created (ack):');
  console.log(JSON.stringify(notif, null, 2));
});

socket.on('broadcastCreated', (info) => {
  console.log('\n📣 Broadcast created:', info);
});

socket.on('notificationError', (err) => {
  console.error('\n❌ Notification error:', err);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Simple interactive CLI to send commands
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('\nCommands:');
console.log("  send <recipient> <content> [url]   - create system notification for recipient");
console.log("  broadcast <r1,r2,...> <content> [url] - broadcast to multiple recipients");
console.log('  exit                               - quit');

rl.on('line', async (line) => {
  const parts = line.trim().split(' ');
  const cmd = parts.shift();
  if (!cmd) return;

  if (cmd === 'exit') {
    rl.close();
    socket.close();
    process.exit(0);
  }

  if (cmd === 'send') {
    const recipient = parts.shift();
    const content = parts.shift();
    const url = parts.shift() || null;
    if (!recipient || !content) {
      console.log('Usage: send <recipient> <content> [url]');
      return;
    }
    socket.emit('sendSystemNotification', { recipient, content, url });
    console.log('Sent sendSystemNotification ->', recipient);
    return;
  }

  if (cmd === 'broadcast') {
    const recipientsStr = parts.shift();
    const content = parts.shift();
    const url = parts.shift() || null;
    if (!recipientsStr || !content) {
      console.log('Usage: broadcast <r1,r2,...> <content> [url]');
      return;
    }
    const recipients = recipientsStr.split(',').map((r) => r.trim()).filter(Boolean);
    socket.emit('broadcastSystemNotification', { recipients, content, url });
    console.log('Sent broadcastSystemNotification ->', recipients.length, 'recipients');
    return;
  }

  console.log('Unknown command:', cmd);
});

process.on('SIGINT', () => {
  console.log('Exiting...');
  rl.close();
  socket.close();
  process.exit(0);
});

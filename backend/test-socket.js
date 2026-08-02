const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
});

socket.on('machineCreated', (data) => {
  console.log('New machine created:', data);
});

socket.on('machineUpdated', (data) => {
  console.log('Machine updated:', data);
}); 
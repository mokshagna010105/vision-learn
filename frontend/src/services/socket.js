import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initiateSocketConnection = (classroomName) => {
  socket = io(SOCKET_URL);
  console.log(`Connecting to WebSocket at ${SOCKET_URL}...`);
  
  if (classroomName && socket) {
    socket.emit('join-classroom', classroomName);
  }
  
  return socket;
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const subscribeToImages = (cb) => {
  if (!socket) return;
  socket.on('new-image', (data) => {
    console.log('Real-time image event received:', data);
    cb(null, data);
  });
};

export const subscribeToSessionEvents = (onStart, onStop, onClear) => {
  if (!socket) return;
  
  socket.on('session-started', (data) => {
    console.log('Session started event:', data);
    onStart(data);
  });

  socket.on('session-stopped', (data) => {
    console.log('Session stopped event:', data);
    onStop(data);
  });

  socket.on('clear-image', (data) => {
    console.log('Clear image event:', data);
    onClear(data);
  });
};

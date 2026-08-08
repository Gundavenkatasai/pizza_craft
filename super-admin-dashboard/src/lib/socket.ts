import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const getBaseUrl = () => {
  const envUrl = (import.meta as any)?.env?.VITE_BACKEND_URL || (import.meta as any)?.env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://pizza-craft-0aov.onrender.com';
  }
  return 'http://localhost:3001';
};

export const getSocket = (): Socket => {
  if (!socket) {
    const baseUrl = getBaseUrl();
    socket = io(baseUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Admin dashboard socket connected:', socket?.id);
      socket?.emit('join-admin-room');
    });

    socket.on('disconnect', () => {
      console.log('Admin dashboard socket disconnected');
    });
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

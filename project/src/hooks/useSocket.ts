import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://pizza-craft-api.onrender.com';
      console.log('Initializing socket connection to:', backendUrl);
      
      socketRef.current = io(backendUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
        
        if (user) {
          console.log('Joining user room:', user.id);
          // Join user-specific room
          socketRef.current?.emit('join-user-room', user.id);
          
          // Join admin room if user is admin
          if (user.role === 'admin') {
            console.log('Joining admin room');
            socketRef.current?.emit('join-admin-room');
          }
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    } else if (user && socketRef.current.connected) {
      // If socket already exists and is connected, join rooms
      console.log('Socket already connected, joining user room:', user.id);
      socketRef.current.emit('join-user-room', user.id);
      
      if (user.role === 'admin') {
        socketRef.current.emit('join-admin-room');
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return socketRef.current;
};

export default useSocket;
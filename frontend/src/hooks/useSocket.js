import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(scanId, onUpdate) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!scanId) return;

    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    socket.emit('subscribe', scanId);
    socket.on('scan:update', data => callbackRef.current(data));

    return () => {
      socket.emit('unsubscribe', scanId);
      socket.disconnect();
    };
  }, [scanId]);
}

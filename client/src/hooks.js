import { useEffect } from 'react';
import { socket } from './socket';

export function useLive(loadData) {
  useEffect(() => {
    loadData();
    socket.on('update', loadData);
    return () => socket.off('update', loadData);
  }, []); 
}

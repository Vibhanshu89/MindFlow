import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect socket
    socketRef.current = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.custom((t) => (
        <div className={`glass rounded-xl p-4 flex gap-3 max-w-sm animate-fade-in ${t.visible ? '' : 'opacity-0'}`}>
          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1 flex-shrink-0 notification-dot" />
          <div>
            <p className="text-sm font-semibold text-white">{notification.title}</p>
            <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
          </div>
        </div>
      ), { duration: 4000 });
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  const joinProject = (projectId) => {
    socketRef.current?.emit('join:project', projectId);
  };

  const leaveProject = (projectId) => {
    socketRef.current?.emit('leave:project', projectId);
  };

  const onEvent = (event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, notifications, joinProject, leaveProject, onEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

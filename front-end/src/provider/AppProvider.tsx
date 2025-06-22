import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface AppContextType {
  socket: Socket | null;
}

const AppContext = createContext<AppContextType>({ socket: null });

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_AUTH_BASEURL, {
      withCredentials: true, // Send cookies (tutorAccessToken)
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("AppProvider socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("AppProvider socket connect error:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      console.log("AppProvider socket disconnected");
    };
  }, []);

  return (
    <AppContext.Provider value={{ socket }}>
      {children}
    </AppContext.Provider>
  );
};
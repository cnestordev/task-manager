import { createContext, useContext, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useUser } from "./UserContext";

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const [connected, setConnected] = useState(false);

  const { socket } = useSocket(user, setConnected);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

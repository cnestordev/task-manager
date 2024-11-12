import { createContext, useContext, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useUser } from "./UserContext";
import { useTask } from "./TaskContext";

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { updateTask } = useTask();
  const [connected, setConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { notifyTaskUpdate, notifyTaskCreated } = useSocket(
    user,
    setConnected,
    setConnectedUsers,
    updateTask
  );

  return (
    <SocketContext.Provider
      value={{ connected, notifyTaskUpdate, notifyTaskCreated, connectedUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};

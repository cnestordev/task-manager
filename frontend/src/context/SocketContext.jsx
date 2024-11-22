import { createContext, useContext, useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useUser } from "./UserContext";
import { useTask } from "./TaskContext";

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { updateTask } = useTask();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { notifyTaskUpdate, notifyTaskCreated } = useSocket(
    user,
    setConnectedUsers,
    updateTask
  );

  useEffect(() => {
    if (!user) {
      setConnectedUsers([]);
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        notifyTaskUpdate,
        notifyTaskCreated,
        connectedUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

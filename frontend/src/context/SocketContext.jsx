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
  const [hasError, setHasError] = useState(false);
  const { notifyTaskUpdate, notifyTaskCreated } = useSocket(
    user,
    setConnectedUsers,
    updateTask,
    setHasError
  );

  return (
    <SocketContext.Provider
      value={{
        notifyTaskUpdate,
        notifyTaskCreated,
        connectedUsers,
        hasError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

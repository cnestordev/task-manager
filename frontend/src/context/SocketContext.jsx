import { createContext, useContext, useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useUser } from "./UserContext";
import { useTask } from "./TaskContext";
import { useComments } from "./CommentContext";

const SocketContext = createContext(null);

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useUser();
  const { updateTask } = useTask();
  const { addCommentToTask } = useComments();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const { notifyTaskUpdate, notifyTaskCreated, notifyCommentCreated } =
    useSocket(user, setConnectedUsers, updateTask, addCommentToTask);

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
        notifyCommentCreated,
        connectedUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

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
  const { addCommentToTask, removeCommentFromTask } = useComments();
  const [connectedUsers, setConnectedUsers] = useState([]);
  const {
    notifyTaskUpdate,
    notifyTaskCreated,
    notifyCommentCreated,
    notifyCommentDeleted,
  } = useSocket(
    user,
    setConnectedUsers,
    updateTask,
    addCommentToTask,
    removeCommentFromTask
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
        notifyCommentCreated,
        notifyCommentDeleted,
        connectedUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

import { createContext, useContext, useState } from "react";
import { getTaskComments } from "../api";

const CommentContext = createContext();
export const useComments = () => useContext(CommentContext);

export const CommentProvider = ({ children }) => {
  const [commentsByTaskId, setCommentsByTaskId] = useState({});
  const [loadingTaskId, setLoadingTaskId] = useState(null);

  const fetchComments = async (taskId) => {
    // IF enabled, prevents fetching the comments if they were already previously loaded
    // if (commentsByTaskId[taskId]) return;

    try {
      setLoadingTaskId(taskId);
      const { data } = await getTaskComments(taskId);
      setCommentsByTaskId((prev) => {
        return {
          ...prev,
          [taskId]: data.comments,
        };
      });
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const addCommentToTask = (comment) => {
    if (!comment?.taskId) return;

    setCommentsByTaskId((prev) => {
      const taskId = comment.taskId;

      return {
        ...prev,
        [taskId]: [comment, ...(prev[taskId] || [])],
      };
    });
  };

  const removeCommentFromTask = (commentObj) => {
    if (!commentObj) return;

    setCommentsByTaskId((prev) => {
      const taskId = commentObj?.taskId;

      const updatedComments = prev[taskId]?.filter(
        (comment) => comment?._id !== commentObj?.commentId
      );

      return {
        ...prev,
        [taskId]: updatedComments,
      };
    });
  };

  return (
    <CommentContext.Provider
      value={{
        commentsByTaskId,
        fetchComments,
        addCommentToTask,
        removeCommentFromTask,
        loadingTaskId,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

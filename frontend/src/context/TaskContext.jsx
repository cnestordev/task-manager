import { createContext, useContext, useEffect, useState } from "react";
import { getTasks } from "../api";
import { reorderTasks } from "../utils/taskTransformations";
import { useUser } from "./UserContext";

const TaskContext = createContext(null);
export const useTask = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [recentlyUpdatedTask, setRecentlyUpdatedTask] = useState(null);
  const { user } = useUser();

  // Get User Tasks on initial load
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks from the database
        const {
          data: { tasks: fetchedTasks },
        } = await getTasks(user);
        const flattenedTasks = reorderTasks(fetchedTasks, user);

        setTasks(flattenedTasks);
      } catch (err) {
        console.log(err);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  const addNewTask = (newTask) => {
    setTasks((prevTasks) => {
      return reorderTasks([...prevTasks, newTask], user);
    });
  };

  const updateTask = (updatedTask, tempId = null) => {

    setTasks((prevTasks) => {
      let taskExists = false;

      const updatedTasks = prevTasks.map((task) => {
        if ((tempId && task._id === tempId) || task._id === updatedTask._id) {
          taskExists = true;

          // If taskPosition is empty in updatedTask, inherit it from the original task
          if (updatedTask.taskPosition.length === 0) {
            updatedTask.taskPosition = task.taskPosition;
          }

          return { ...task, ...updatedTask };
        }
        return task;
      });

      // If the task doesn't exist in prevTasks, add it
      if (!taskExists) {
        updatedTasks.push(updatedTask);
      }

      // reorder the tasks after updating or adding
      return reorderTasks(updatedTasks, user);
    });
  };

  const updateTasks = (tasksToUpdate) => {
    const updateMap = new Map(tasksToUpdate.map((task) => [task._id, task]));

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map(
        (task) => updateMap.get(task._id) || task
      );
      let newOrder = reorderTasks(updatedTasks, user);
      return newOrder;
    });
  };

  //   Remove task from UI if task creation fails on server
  const removeTask = (taskToRemove) => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task._id !== taskToRemove._id)
    );
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addNewTask,
        updateTask,
        updateTasks,
        removeTask,
        recentlyUpdatedTask,
        setRecentlyUpdatedTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

import { WarningIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Progress,
  Text,
  useToast
} from "@chakra-ui/react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCommentToTask,
  createTask,
  removeCommentFromTask,
  updateTaskOrder,
  updateTasksOrderOnServer,
} from "../api/index";
import "../App.css";
import { useSocketContext } from "../context/SocketContext";
import { useTask } from "../context/TaskContext";
import { useUser } from "../context/UserContext";
import {
  handleAddComment,
  handleAddTask,
  handleDragEnd,
  handleRemoveComment,
  handleRemoveTask,
  updateSelectedTask,
} from "../utils/taskUtils";
import CompletedTaskModal from "./CompletedTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import EditTaskModal from "./EditTaskModal";
import NotFoundTaskModal from "./NotFoundTaskModal";
import PriorityColumn from "./PriorityColumn";
import { TaskDrawer } from "./TaskDrawer";

const TaskBoard = ({ setDashboardFunction }) => {
  const { tasks, addNewTask, removeTask, updateTask, updateTasks, fetchTasks } =
    useTask();
  const navigate = useNavigate();
  const { user } = useUser();
  const { notifyTaskUpdate, notifyTaskCreated } = useSocketContext();
  const toast = useToast();
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotFoundModalOpen, setIsNotFoundModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [progress, setProgress] = useState(100);
  const [viewedTask, setViewedTask] = useState(null);
  const animationRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const [isProgressVisible, setIsProgressVisible] = useState(false);

  const syncTimer = useRef(null);
  const { id: taskId } = useParams();

  // Cancel debounce on unmount (cleanup)
  useEffect(() => {
    return () => {
      clearTimeout(syncTimer.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const debouncedSyncToServer = useCallback(
    (tasks) => {
      const duration = 5000;

      // Cancel previous debounce timer and animation
      if (syncTimer.current) clearTimeout(syncTimer.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);

      // Reset and start animation
      setProgress(0);
      setIsProgressVisible(true);
      animationStartTimeRef.current = performance.now();

      const animate = (now) => {
        const elapsed = now - animationStartTimeRef.current;
        const percent = Math.min(100, (elapsed / duration) * 100);

        setProgress(percent);

        if (elapsed < duration) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setProgress(100);
          setTimeout(() => {
            setIsProgressVisible(false);
            setProgress(0);
          }, 200);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      // Set new debounce timer
      syncTimer.current = setTimeout(() => {
        (async () => {
          try {
            const response = await updateTasksOrderOnServer(tasks);
            const message =
              response?.data?.message || "Task updated successfully";
            toast({
              title: "Task Updated",
              description: message,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } catch (error) {
            console.error("Error syncing tasks to server:", error);
            toast({
              title: "Sync error",
              description: "Could not sync task order with server.",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } finally {
            syncTimer.current = null;
          }
        })();
      }, duration);
    },
    [toast]
  );

  useEffect(() => {
    if (taskId && tasks.length) {
      const foundTask = tasks.find((task) => task._id === taskId);
      if (foundTask) {
        setViewedTask(foundTask);
        setIsDrawerOpen(true);
      } else {
        setViewedTask(null);
        setIsDrawerOpen(false);
        setIsNotFoundModalOpen(true); // open alert modal when not found
      }
    } else {
      setViewedTask(null);
      setIsDrawerOpen(false);
    }
  }, [taskId, tasks]);

  const onClose = () => {
    setIsDrawerOpen(false);
    setViewedTask(null);
    navigate("/taskboard");
  };

  // Add new comment
  const addNewComment = async (commentText) => {
    try {
      const response = await handleAddComment(
        viewedTask,
        commentText,
        addCommentToTask
      );
      const newComment = response.data.comment;
      toast({
        title: "Comment Added.",
        description: "Your comment has been added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return newComment;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong.";
      toast({
        title: "Error",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="white"
            p={3}
            bg="red.500"
            borderRadius="md"
          >
            <Text mb={2}>{errorMessage}</Text>
            <Button
              colorScheme="white"
              onClick={() => {
                fetchTasks(true);
                onClose();
              }}
            >
              Refresh
            </Button>
          </Box>
        ),
      });
    }
  };

  const removeComment = async (comment) => {
    try {
      const response = await handleRemoveComment(
        comment,
        removeCommentFromTask
      );

      toast({
        title: "Comment Deleted.",
        description: "Your comment has been removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      return response?.data?.comment;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred.";
      toast({
        title: "Error",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="white"
            p={3}
            bg="red.500"
            borderRadius="md"
          >
            <Text mb={2}>{errorMessage}</Text>
            <Button
              colorScheme="white"
              onClick={() => {
                fetchTasks(true);
                onClose();
              }}
            >
              Refresh
            </Button>
          </Box>
        ),
      });
    }
  };

  // Add a new task
  const addTask = async (formData) => {
    const newTaskPosition = tasks.filter(
      (task) => task.priority === formData.priority
    ).length;
    try {
      const isTeamCard = formData.addedUsers.length > 0;
      const newTaskObj = {
        title: formData.title,
        description: formData.description,
        assignedTo: [...formData.addedUsers.map((user) => user._id)],
        teamId: isTeamCard ? user.team._id || user.team.id : null,
        taskPosition: [
          {
            priority: formData.priority,
            position: newTaskPosition,
          },
        ],
      };
      const data = await handleAddTask(
        newTaskObj,
        addNewTask,
        updateTask,
        createTask,
        removeTask
      );

      const createdTask = data.tasks;

      navigate(`/taskboard/${createdTask._id}`);

      // Notify websocket server of new task if it belongs to a team
      if (createdTask.teamId) {
        notifyTaskCreated(createdTask);
      }

      toast({
        title: "Task created.",
        description: "Your task has been added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "An error occurred while creating the task.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // pass addTask back up to App
  useEffect(() => {
    const dashboardSpecificFunction = (formData) => {
      addTask(formData);
    };

    setDashboardFunction(() => dashboardSpecificFunction);
  }, [setDashboardFunction]);

  const onRemoveTask = async () => {
    try {
      setIsDeleteModalOpen(false);

      const copiedTasks = JSON.parse(JSON.stringify(tasks));
      const backUpTasks = JSON.parse(JSON.stringify(tasks));

      const updatedTask = { ...selectedTask, isDeleted: true };

      // new array of tasks excluding the deleted task
      const remainingTasks = copiedTasks.filter(
        (task) => task._id !== selectedTask._id
      );

      // tasks of the same priority that are not deleted
      const samePriorityTasks = remainingTasks.filter(
        (task) => task.priority === selectedTask.priority
      );

      // exclude any tasks that have been deleted or completed
      const activePriorityTasks = samePriorityTasks.filter(
        (task) => !(task.isDeleted || task.isCompleted)
      );

      // sort these tasks by their current position
      activePriorityTasks.sort((a, b) => a.position - b.position);

      // reassign positions to remaining tasks with the same priority
      let currentIndex = 0;
      activePriorityTasks.forEach((task) => {
        if (task.position >= 0) {
          // skip any tasks whose positoins have not yet been set, ie task postion is -1
          task.position = currentIndex;
          currentIndex++;
        }
      });

      // Prepare the payload
      const recalucatedTasks = [...activePriorityTasks, updatedTask];

      await handleRemoveTask(
        recalucatedTasks,
        updateTasks,
        updateTasksOrderOnServer,
        backUpTasks
      );

      navigate("/taskboard");

      // Notify websocket server of task deletion if it belongs to a team
      if (updatedTask.teamId) {
        notifyTaskUpdate(updatedTask);
      }

      setSelectedTask(null);
      toast({
        title: "Task deleted.",
        description: "Your task has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMessage =
        error?.response?.data?.message || "Something went wrong.";

      toast({
        title: "Error",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="white"
            p={3}
            bg="red.500"
            borderRadius="md"
          >
            <Text mb={2}>{errorMessage}</Text>
            <Button
              colorScheme="white"
              onClick={() => {
                fetchTasks(true);
                onClose();
              }}
            >
              Refresh
            </Button>
          </Box>
        ),
      });
    }
  };

  // Toggle a task's completed status
  const onToggleTaskCompletion = async () => {
    try {
      setIsCompletedModalOpen(false);
      const copiedTasks = JSON.parse(JSON.stringify(tasks));
      const backUpTasks = JSON.parse(JSON.stringify(tasks));

      // Toggle the isCompleted value
      const updatedTask = {
        ...selectedTask,
        isCompleted: !selectedTask.isCompleted,
      };

      let recalculatedTasks;

      if (updatedTask.isCompleted) {
        // When the task is completed: remove it from the list and reassign positions
        const remainingTasks = copiedTasks.filter(
          (task) => task._id !== selectedTask._id
        );

        // Filter tasks with the same priority, excluding deleted and completed ones
        const sameCompletedStatus = remainingTasks.filter(
          (task) =>
            task.priority === selectedTask.priority &&
            !task.isDeleted &&
            !task.isCompleted
        );

        // Sort these tasks by their current position
        sameCompletedStatus.sort((a, b) => a.position - b.position);

        // Reassign positions to remaining tasks with the same priority
        sameCompletedStatus.forEach((task, index) => {
          task.position = index;
        });

        recalculatedTasks = [...sameCompletedStatus, updatedTask];
      } else {
        // When the task is reverted to incomplete: add it to the end of the array
        const remainingTasks = copiedTasks.filter(
          (task) => task._id !== selectedTask._id
        );

        // Filter tasks with the same priority, excluding deleted ones
        const samePriorityTasks = remainingTasks.filter(
          (task) => task.priority === selectedTask.priority && !task.isDeleted
        );

        // Sort these tasks by their current position
        samePriorityTasks.sort((a, b) => a.position - b.position);

        // Add the updated task to the end with the correct new position
        updatedTask.position = samePriorityTasks.length; // Exclude deleted tasks from position calculation
        recalculatedTasks = [...samePriorityTasks, updatedTask];
      }

      await handleRemoveTask(
        recalculatedTasks,
        updateTasks,
        updateTasksOrderOnServer,
        backUpTasks
      );

      if (updatedTask.teamId) {
        notifyTaskUpdate(updatedTask);
      }

      setSelectedTask(null);

      toast({
        title: updatedTask.isCompleted
          ? "Task completed."
          : "Task marked incomplete.",
        description: updatedTask.isCompleted
          ? "Your task has been marked as completed successfully."
          : "Your task has been marked as incomplete.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      const errorMessage =
        error?.response?.data?.message || "Something went wrong.";

      toast({
        title: "Error",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="white"
            p={3}
            bg="red.500"
            borderRadius="md"
          >
            <Text mb={2}>{errorMessage}</Text>
            <Button
              colorScheme="white"
              onClick={() => {
                fetchTasks(true);
                onClose();
              }}
            >
              Refresh
            </Button>
          </Box>
        ),
      });
    }
  };

  // Save changes when editing a task
  const saveTaskChanges = async (formData, resetForm) => {
    try {
      const isTeamCard = formData.addedUsers.length > 0;
      const updatedData = JSON.parse(JSON.stringify(selectedTask));
      updatedData.title = formData.title;
      updatedData.description = formData.description;
      (updatedData.teamId = isTeamCard
        ? user.team._id || user.team.id
        : updatedData.teamId),
        (updatedData.assignedTo = [
          ...updatedData.assignedTo,
          ...formData.addedUsers,
        ]);

      const data = await updateSelectedTask(
        updatedData,
        updateTask,
        updateTaskOrder,
        selectedTask
      );
      const returnedUpdatedTask = data.tasks;

      // Notify the websocket server of updated task
      if (returnedUpdatedTask.teamId) {
        const taskWithNewUsers = {
          ...returnedUpdatedTask,
          newUsers: [...formData.addedUsers],
        };
        notifyTaskUpdate(taskWithNewUsers);
      }

      setIsEditModalOpen(false);
      setSelectedTask(null);
      resetForm();
      toast({
        title: "Task updated.",
        description: "Your task has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setIsEditModalOpen(true);
      console.error("Error saving task changes:", error);
      const errorMessage =
        error?.response?.data?.message || "Something went wrong.";
      toast({
        title: "Error",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            color="white"
            p={3}
            bg="red.500"
            borderRadius="md"
          >
            <Text mb={2}>{errorMessage}</Text>
            <Button
              colorScheme="white"
              onClick={() => {
                fetchTasks(true);
                onClose();
              }}
            >
              Refresh
            </Button>
          </Box>
        ),
      });
    }
  };

  const onDragUpdate = (update) => {
    const { destination } = update;

    if (destination) {
      setActiveColumn(destination.droppableId);
    } else {
      setActiveColumn(null);
    }
  };

  // Priorities for tasks (columns)
  const priorities = ["High", "Medium", "Low"];

  return (
    <>
      {isProgressVisible && (
        <Box
          position="fixed"
          bottom="20px"
          right="20px"
          bg="gray.700"
          color="white"
          p={3}
          borderRadius="md"
          w={200}
        >
          <Box display="flex">
            <WarningIcon position="relative" top="3px" mr={1} />
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                Updating task order.
              </Text>
              <Text> Please wait.</Text>
            </Box>
          </Box>
          <Progress
            value={progress}
            size="lg"
            colorScheme="blue"
            hasStripe
            isAnimated
          />
        </Box>
      )}

      {isDrawerOpen && viewedTask && (
        <TaskDrawer
          isOpen={isDrawerOpen}
          onClose={onClose}
          task={viewedTask}
          addNewComment={addNewComment}
          removeComment={removeComment}
          editTask={(task) => {
            setSelectedTask(task);
            setIsEditModalOpen(true);
          }}
          completedTask={(task) => {
            setSelectedTask(task);
            setIsCompletedModalOpen(true);
          }}
          deleteTask={(task) => {
            setSelectedTask(task);
            setIsDeleteModalOpen(true);
          }}
        />
      )}

      <NotFoundTaskModal
        isOpen={isNotFoundModalOpen}
        onClose={() => {
          setIsNotFoundModalOpen(false);
          navigate("/taskboard");
        }}
      />

      {/* Delete Task Modal */}
      {selectedTask && isDeleteModalOpen && (
        <DeleteTaskModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
          }}
          taskTitle={selectedTask.title}
          handleRemoveTask={onRemoveTask}
        />
      )}
      {/* Completed Task Modal */}
      {selectedTask && isCompletedModalOpen && (
        <CompletedTaskModal
          isOpen={isCompletedModalOpen}
          onClose={() => {
            setIsCompletedModalOpen(false);
          }}
          task={selectedTask}
          handleCompletedTask={onToggleTaskCompletion}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          saveTaskChanges={saveTaskChanges}
          selectedTask={selectedTask}
        />
      )}

      {/* Drag and Drop Context */}
      <DragDropContext
        onDragUpdate={onDragUpdate}
        onDragEnd={(result) => {
          try {
            setActiveColumn(null);
            const newTasksOrder = handleDragEnd(result, tasks);
            if (!newTasksOrder) return;
            updateTasks(newTasksOrder);
            debouncedSyncToServer(newTasksOrder);
          } catch (error) {
            console.error("Error handling drag end:", error);
            const errorMessage =
              error?.response?.data?.message || "Something went wrong.";
            toast({
              title: "Error",
              status: "error",
              duration: 5000,
              isClosable: true,
              render: ({ onClose }) => (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  color="white"
                  p={3}
                  bg="red.500"
                  borderRadius="md"
                >
                  <Text mb={2}>{errorMessage}</Text>
                  <Button
                    colorScheme="white"
                    onClick={() => {
                      fetchTasks(true);
                      onClose();
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              ),
            });
          }
        }}
      >
        <Box
          display="flex"
          flexDirection={["column", "column", "row"]}
          wrap="nowrap"
          className="columns-container"
        >
          {priorities.map((priority) => (
            <PriorityColumn
              key={priority}
              deleteTask={(task) => {
                setSelectedTask(task);
                setIsDeleteModalOpen(true);
              }}
              editTask={(task) => {
                setSelectedTask(task);
                setIsEditModalOpen(true);
              }}
              completedTask={(task) => {
                setSelectedTask(task);
                setIsCompletedModalOpen(true);
              }}
              viewTask={(task) => {
                setViewedTask(task);
                navigate(`/taskboard/${task._id}`);
              }}
              priority={priority}
              tasks={tasks?.filter((task) => task?.priority === priority)}
              isActive={activeColumn === priority}
              id={priority}
            />
          ))}
        </Box>
      </DragDropContext>
    </>
  );
};

export default TaskBoard;

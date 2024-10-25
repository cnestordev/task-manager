import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";
import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useLoading } from "../context/LoadingContext";
import { useTask } from "../context/TaskContext";
import { useUser } from "../context/UserContext";
import useSocket from "../hooks/useSocket";
import AlertModal from "./AlertModal";
import "./TaskCard.css";

const TaskCard = ({
  task,
  deleteTask,
  editTask,
  completedTask,
  index,
  toggleExpand,
}) => {
  const { loadingTaskId } = useLoading();
  const taskIdMatch = loadingTaskId === task._id;
  const { user } = useUser();
  const { updateTask: updateTaskContext, recentlyUpdatedTask } = useTask();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingUpdateTask, setPendingUpdateTask] = useState(null);

  // Use the socket hook to join the task room and handle updates
  const { updateTask } = useSocket(
    task._id,
    task.assignedTo.length,
    (taskData) => {
      if (taskData.userId !== user.id) {
        setPendingUpdateTask(taskData.task);
        setIsModalOpen(true);
      }
    },
    user
  );

  useEffect(() => {
    console.log(recentlyUpdatedTask);
    if (recentlyUpdatedTask && recentlyUpdatedTask._id === task._id) {
      // Notify the websocket server of the updated task
      updateTask(recentlyUpdatedTask);
    }
  }, [recentlyUpdatedTask]);

  const handleConfirm = () => {
    // Update the context with the stored updated task
    if (pendingUpdateTask) {
      updateTaskContext(pendingUpdateTask);
      setPendingUpdateTask(null);
    }
    setIsModalOpen(false);
  };

  const handleEditTask = (selectedTask) => {
    editTask(selectedTask);
  };

  return (
    <>
      {isModalOpen && (
        <AlertModal
          task={task}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirm}
        />
      )}

      <Draggable
        isDragDisabled={task.isCompleted}
        key={task._id}
        draggableId={task._id}
        index={index}
      >
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`task-card ${taskIdMatch ? "loading-border" : ""} ${
              task.isCompleted ? "task-card-completed" : "task-card-inprogress"
            } ${task.isDeleted ? "task-card-hidden" : ""}`}
            onClick={() => toggleExpand(task)}
          >
            <svg
              style={{ display: taskIdMatch ? "block" : "none" }}
              height="100%"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                rx="8"
                ry="8"
                className="line"
                height="100%"
                width="100%"
                strokeLinejoin="round"
              />
            </svg>
            <Accordion allowToggle index={task.isExpanded ? [0] : []}>
              <AccordionItem border="none">
                <h2>
                  <AccordionButton padding="0" _hover={{ background: "none" }}>
                    <Box
                      as="span"
                      flex="1"
                      textAlign="center"
                      fontWeight="bold"
                      fontSize="18px"
                    >
                      {task.title}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={2}>
                  <Box as="p" textAlign="center" fontSize="15px" mb={2}>
                    {task.description}
                  </Box>
                  <Flex gap="30px" justifyContent="center" marginTop="4">
                    <Button
                      aria-label="Edit Task"
                      size="sm"
                      className="task-btns edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(e, task);
                      }}
                    >
                      <FaEdit />
                      Edit
                    </Button>
                    <Button
                      aria-label="Complete Task"
                      size="sm"
                      className="task-btns complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        completedTask(e, task);
                      }}
                    >
                      {task.isCompleted ? "Restore" : "Complete"}
                    </Button>
                    <Button
                      aria-label="Delete Task"
                      size="sm"
                      className="task-btns delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(e, task);
                      }}
                    >
                      Delete
                    </Button>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        )}
      </Draggable>
    </>
  );
};

export default TaskCard;

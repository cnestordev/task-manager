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
import { useLoading } from "../context/LoadingContext";
import { useUser } from "../context/UserContext";
import { StatusIndicator } from "./StatusIndicator";
import "./TaskCard.css";

const TaskCard = ({
  task,
  deleteTask,
  editTask,
  completedTask,
  index,
  toggleExpand,
  tab,
}) => {
  const { loadingTaskId } = useLoading();
  const taskIdMatch = loadingTaskId === task._id;
  const { user } = useUser();
  const [isTaskShared, setIsTaskShared] = useState(task.assignedTo.length > 1);
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    setIsTaskShared(task.assignedTo.length > 1);
  }, [task.assignedTo]);

  const handleEditTask = (selectedTask) => {
    editTask(selectedTask);
  };

  return (
    <Draggable
      isDragDisabled={task.isCompleted}
      key={task._id}
      draggableId={task._id}
      index={index}
    >
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card 
            ${darkMode ? "dark" : ""} 
            ${taskIdMatch ? "loading-border" : ""} 
            ${
              task.isCompleted ? "task-card-completed" : "task-card-inprogress"
            } 
            ${
              task.isDeleted || (tab === "inprogress" && task.isCompleted)
                ? "task-card-hidden"
                : ""
            }
            ${
              snapshot.isDragging
                ? darkMode
                  ? "task-card-dragging-dark"
                  : "task-card-dragging"
                : ""
            }
          `}
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
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom="5"
                  >
                    <div>
                      {!task.isExpanded && (
                        <StatusIndicator
                          assignedTo={task.assignedTo}
                          user={user}
                          className={isTaskShared ? "" : "hidden"}
                          isExpanded={task.isExpanded}
                        />
                      )}
                    </div>
                    <p>{task.title}</p>
                    <div></div>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={2}>
                <Box as="p" textAlign="center" fontSize="15px" mb={2}>
                  {task.description}
                </Box>
                <Box my={4} display="flex" justifyContent="center">
                  {task.isExpanded && (
                    <StatusIndicator
                      assignedTo={task.assignedTo}
                      user={user}
                      className={isTaskShared ? "" : "hidden"}
                      isExpanded={task.isExpanded}
                    />
                  )}
                </Box>
                <Flex gap="30px" justifyContent="center" marginTop="4">
                  <Button
                    aria-label="Edit Task"
                    size="sm"
                    className="task-btns edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTask(task);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    aria-label="Complete Task"
                    size="sm"
                    className="task-btns complete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      completedTask(task);
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
                      deleteTask(task);
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
  );
};

export default TaskCard;

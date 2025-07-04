import { Draggable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { convertIsoToString } from "../utils/taskUtils";
import { StatusIndicator } from "./StatusIndicator";
import "./TaskCard.css";

const TaskCard = ({ task, index, viewTask }) => {
  const { user } = useUser();
  const [isTaskShared, setIsTaskShared] = useState(task.assignedTo.length > 1);
  const darkMode = user?.darkMode || false;

  useEffect(() => {
    setIsTaskShared(task.assignedTo.length > 1);
  }, [task.assignedTo]);

  return (
    <Draggable
      isDragDisabled={task.isCompleted}
      key={task._id}
      draggableId={task._id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card 
            ${darkMode ? "dark" : ""} 
            ${
              task.isCompleted ? "task-card-completed" : "task-card-inprogress"
            } 
            ${task.isDeleted ? "task-card-hidden" : ""}
            ${
              snapshot.isDragging
                ? darkMode
                  ? "task-card-dragging-dark"
                  : "task-card-dragging"
                : ""
            }
          `}
          onClick={() => viewTask(task)}
        >
          <div className="task-header">
            <h2>{task.title}</h2>
            <p>{convertIsoToString(task.created)}</p>
          </div>

          <div className="task-description">
            <p title={task.description}>
              {task.description.length > 100
                ? `${task.description.slice(0, 100)}...`
                : task.description}
            </p>
          </div>

          {isTaskShared && (
            <div className="task-status">
              <StatusIndicator
                assignedTo={task.assignedTo}
                user={user}
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;

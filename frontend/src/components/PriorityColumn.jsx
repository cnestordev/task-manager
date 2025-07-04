import {
  Box,
  Tab,
  TabList,
  Tabs
} from "@chakra-ui/react";
import { Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useUser } from "../context/UserContext";
import "./PriorityColumn.css";
import TaskCard from "./TaskCard";

const PriorityColumn = ({
  priority,
  tasks,
  deleteTask,
  editTask,
  completedTask,
  id,
  isActive,
  viewTask,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  // Separate tasks into in-progress and completed
  const inProgressTasks = tasks.filter(
    (task) => !task.isCompleted && !task.isDeleted
  );
  const completedTasks = tasks.filter(
    (task) => task.isCompleted && !task.isDeleted
  );
  const inProgressTasksCount = tasks.filter(
    (task) => !task.isCompleted && !task.isDeleted
  ).length;
  const completedTasksCount = tasks.filter(
    (task) => task.isCompleted && !task.isDeleted
  ).length;

  const { user } = useUser();
  const darkMode = user?.darkMode || false;

  return (
    <Box
      className={`column ${darkMode ? "dark" : ""} ${isActive ? "active" : ""}`}
      minWidth="300px"
      flexShrink={0}
    >
      <div className={`header header-${priority.toLowerCase()}`}>
        <div></div>
        <div className="header-content">
          <h1 className="title">{priority} Priority</h1>
          <Tabs
            onChange={(index) => setTabIndex(index)}
            isLazy
            variant="unstyled"
          >
            <TabList>
              <Tab
                className={`column-pill ${darkMode ? "dark" : ""} ${
                  tabIndex === 0 ? "selected" : ""
                }`}
                _selected={{
                  borderRadius: "50px",
                }}
              >
                In Progress ({inProgressTasksCount})
              </Tab>
              <Tab
                className={`column-pill ${darkMode ? "dark" : ""} ${
                  tabIndex === 1 ? "selected" : ""
                }`}
                isDisabled={completedTasksCount === 0}
                _selected={{
                  borderRadius: "50px",
                }}
              >
                Completed ({completedTasks.length})
              </Tab>
            </TabList>
          </Tabs>
        </div>
      </div>

      <div className="tasks-container">
        <Droppable droppableId={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(tabIndex === 0 ? inProgressTasks : completedTasks).map(
                (task, index) => (
                  <TaskCard
                    deleteTask={deleteTask}
                    editTask={editTask}
                    completedTask={completedTask}
                    key={task._id}
                    task={task}
                    index={index}
                    tab={tabIndex === 0 ? "inprogress" : "completed"}
                    viewTask={viewTask}
                  />
                )
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </Box>
  );
};

export default PriorityColumn;

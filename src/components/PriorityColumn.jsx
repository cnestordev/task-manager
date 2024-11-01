import {
  ChevronDownIcon,
  ChevronUpIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tab,
  TabList,
  Tabs,
} from "@chakra-ui/react";
import { Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import "./PriorityColumn.css";
import TaskCard from "./TaskCard";

const PriorityColumn = ({
  priority,
  tasks,
  deleteTask,
  editTask,
  completedTask,
  toggleTaskExpansion,
  toggleExpand,
  id,
  isActive,
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const getColor = (priority) => {
    switch (priority) {
      case "High":
        return "#c36871";
      case "Medium":
        return "#c18f35";
      case "Low":
        return "#b1aa43";
      default:
        return "gray";
    }
  };

  const color = getColor(priority);

  // Separate tasks into in-progress and completed
  const inProgressTasks = tasks.filter((task) => task);
  const completedTasks = tasks.filter((task) => task.isCompleted);
  const inProgressTasksCount = tasks.filter(
    (task) => !task.isCompleted && !task.isDeleted
  );
  const completedTasksCount = tasks.filter(
    (task) => task.isCompleted && !task.isDeleted
  );

  return (
    <Box
      className={`column ${isActive ? "active" : ""}`}
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
                _selected={{
                  color: color,
                  borderBottom: `2px solid ${color}`,
                }}
              >
                In Progress ({inProgressTasksCount.length})
              </Tab>
              <Tab
                isDisabled={completedTasksCount.length === 0}
                _selected={{
                  color: color,
                  borderBottom: `2px solid ${color}`,
                }}
              >
                Completed ({completedTasks.length})
              </Tab>
            </TabList>
          </Tabs>
        </div>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
            variant=""
          />
          <MenuList>
            <MenuItem
              onClick={() => toggleTaskExpansion(priority, true)}
              icon={<ChevronUpIcon />}
            >
              Expand All
            </MenuItem>
            <MenuItem
              onClick={() => toggleTaskExpansion(priority, false)}
              icon={<ChevronDownIcon />}
            >
              Collapse All
            </MenuItem>
          </MenuList>
        </Menu>
      </div>

      <div className="tasks-container">
        <Droppable droppableId={id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {tabIndex === 0 &&
                inProgressTasks.map((task, index) => (
                  <TaskCard
                    toggleExpand={toggleExpand}
                    deleteTask={deleteTask}
                    editTask={editTask}
                    completedTask={completedTask}
                    key={task._id}
                    task={task}
                    index={index}
                    tab="inprogress"
                  />
                ))}
              {tabIndex === 1 &&
                completedTasks.map((task, index) => (
                  <TaskCard
                    toggleExpand={toggleExpand}
                    deleteTask={deleteTask}
                    editTask={editTask}
                    completedTask={completedTask}
                    key={task._id}
                    task={task}
                    index={index}
                    tab="completed"
                  />
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </Box>
  );
};

export default PriorityColumn;

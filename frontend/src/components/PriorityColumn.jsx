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
import { useUser } from "../context/UserContext";

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
                _selected={{
                  color: "#000",
                  backgroundColor: darkMode ? "#4e5f6b" : "#dce1e7",
                  borderRadius: "50px",
                }}
              >
                In Progress ({inProgressTasksCount})
              </Tab>
              <Tab
                isDisabled={completedTasksCount === 0}
                _selected={{
                  color: "#000",
                  backgroundColor: darkMode ? "#4e5f6b" : "#dce1e7",
                  borderRadius: "50px",
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
              {(tabIndex === 0 ? inProgressTasks : completedTasks).map(
                (task, index) => (
                  <TaskCard
                    toggleExpand={toggleExpand}
                    deleteTask={deleteTask}
                    editTask={editTask}
                    completedTask={completedTask}
                    key={task._id}
                    task={task}
                    index={index}
                    tab={tabIndex === 0 ? "inprogress" : "completed"}
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

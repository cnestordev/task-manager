import { cleanupTask } from "./taskTransformations";

// Optimistically update tasks in the UI and sync with the backend
export const updateTasksOptimistically = async (
    updatedTask,
    updateTasks,
    updateTaskOnServer,
    selectedTask
) => {
    // Optimistic UI update
    updateTasks(updatedTask);

    try {
        // Send the updated task to the server
        const { data } = await updateTaskOnServer(updatedTask);

        // Re-sync the task if the server returns something different
        updateTasks(data.tasks);

        return data;
    } catch (error) {
        // Rollback the optimistic update if there's an error
        updateTasks(selectedTask);
        console.error("Error updating task:", error);
        throw error;
    }
};

// Optimistically add a new task to the UI and sync with the backend
export const addTaskOptimistically = async (
    newTaskData,
    addNewTask,
    updateTask,
    createTaskOnServer,
    removeTask,
) => {
    // Generate a temporary ID for the new task
    const tempId = `temp-${Date.now()}`;
    const tempTask = { ...newTaskData, _id: tempId, taskPosition: [{ ...newTaskData.taskPosition[0], isExpanded: true }] };

    // Optimistic UI update: Add the new task
    addNewTask(tempTask);

    try {
        // Send the new task data to the server
        const { data } = await createTaskOnServer(newTaskData);
        const createdTask = data.tasks;

        console.log(createdTask);

        // Update the task in the UI with the actual data from the server
        updateTask(createdTask, tempId);

        return data;

    } catch (error) {
        console.error("Error creating new task:", error);
        // Remove the temporary task from the UI
        removeTask(tempTask);

        // Throw the error to let the caller handle it (e.g., show a toast)
        throw new Error("Task creation failed on the server.");
    }
};

// Add a new task
export const handleAddTask = async (newTask, addNewTask, updateTask, createTaskOnServer, removeTask) => {
    try {
        const data = await addTaskOptimistically(newTask, addNewTask, updateTask, createTaskOnServer, removeTask);
        return data;
    } catch (error) {
        throw new Error(error);
    }
};

// Remove a task by marking it as deleted
export const handleRemoveTask = async (updatedTasks, updateTasks, updateTaskOrder, selectedTask) => {
    const cleanedUpTasks = updatedTasks.map(task => cleanupTask(task));
    await updateTasksOptimistically(cleanedUpTasks, updateTasks, updateTaskOrder, selectedTask);
};

// Modify the selected task
export const updateSelectedTask = async (updatedTask, updateTasks, updateTaskOrder, selectedTask) => {
    const cleanedUpTask = cleanupTask(updatedTask);
    const data = await updateTasksOptimistically(cleanedUpTask, updateTasks, updateTaskOrder, selectedTask);
    return data;
};

export const handleDragEnd = async (
    result,
    tasks,
    updateTasksOnServer,
    updateTasks,
) => {
    const { destination, source } = result;

    // If there's no destination (e.g., the task was dropped outside a droppable area), do nothing.
    if (!destination) return;

    // If the task was dropped back in the same position, do nothing.
    if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
    ) {
        return;
    }

    // Create a deep copy of the tasks.
    let updatedTasks = tasks.map((task) => ({ ...task }));

    const sourcePriority = source.droppableId;
    const destinationPriority = destination.droppableId;

    // Get all tasks in the source and destination columns, excluding deleted and completed tasks.
    const sourceTasks = updatedTasks
        .filter((task) => task.priority === sourcePriority && !task.isCompleted);

    const destinationTasks = updatedTasks
        .filter((task) => task.priority === destinationPriority && !task.isCompleted);

    // If the task is moved within the same priority column
    if (source.droppableId === destination.droppableId) {
        // Log initial state of sourceTasks
        console.log("Initial sourceTasks:", JSON.parse(JSON.stringify(sourceTasks)));

        // Remove task from source index
        const removedTask = sourceTasks.splice(source.index, 1)[0];
        console.log(`Removed task at index ${source.index}:`, removedTask);

        // Insert task at destination index
        sourceTasks.splice(destination.index, 0, removedTask);
        console.log(`Inserted removed task at index ${destination.index}. Updated sourceTasks:`, JSON.parse(JSON.stringify(sourceTasks)));

        // Filter out completed or deleted tasks
        const filteredSourceTasks = sourceTasks.filter(task => !(task.isCompleted || task.isDeleted));
        console.log("Filtered sourceTasks (excluding completed or deleted):", JSON.parse(JSON.stringify(filteredSourceTasks)));

        // Reassign positions in filtered source tasks
        filteredSourceTasks.forEach((task, i) => {
            task.position = i;
            console.log(`Reassigned position for task ID ${task._id}:`, task);
        });

    }
    else {
        // If the task is moved to a different priority column
        const removedTask = sourceTasks.splice(source.index, 1)[0];
        removedTask.priority = destination.droppableId;

        // Add task to the new priority column and reassign positions in both columns
        destinationTasks.splice(destination.index, 0, removedTask);
        const filteredSourceTasks = sourceTasks.filter(task => !(task.isCompleted || task.isDeleted));
        const filteredDestinationTasks = destinationTasks.filter(task => !(task.isCompleted || task.isDeleted));
        filteredSourceTasks.forEach((task, i) => task.position = i);
        filteredDestinationTasks.forEach((task, i) => task.position = i);
    }

    // Update the tasks in the state optimistically.
    const cleanedUpTask = updatedTasks.map(task => cleanupTask(task));
    updateTasks(cleanedUpTask);

    try {
        // Update the tasks on the server.
        await updateTasksOnServer(cleanedUpTask);
    } catch (error) {
        // If there's an error, revert to the original tasks.
        updateTasks(tasks);
        console.error("Error updating tasks on the server:", error);
        throw error;
    }
};

// Expand or collapse individual task
export const toggleExpand = async (task, updateTask, updateTaskOrder, originalTasks) => {
    const cleanedUpTask = cleanupTask(task);
    const response = await updateTasksOptimistically(cleanedUpTask, updateTask, updateTaskOrder, originalTasks);
    return response;
};

// Expand or collapse all tasks in a priority
export const toggleTaskExpansion = async (tasks, updateTasks, updateTaskOrder, originalTasks) => {
    const cleanedUpTasks = tasks.map(task => cleanupTask(task));
    await updateTasksOptimistically(cleanedUpTasks, updateTasks, updateTaskOrder, originalTasks);
};

export const convertIsoToString = (isoString) => {
    const date = new Date(isoString);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

export const handleAddComment = async (task, commentText, handleAddCommentFn) => {
    const response = await handleAddCommentFn(task._id, commentText);
    return response;
};

export const handleRemoveComment = async (comment, handleRemoveCommentFn) => {
    const response = await handleRemoveCommentFn(comment);
    return response;
};
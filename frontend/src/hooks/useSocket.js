import { useToast } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (user, setConnectedUsers, updateTask, addCommentToTask) => {
    const socketRef = useRef(null);
    const toast = useToast();

    // Emits an update for a modified task to notify other users
    const notifyTaskUpdate = (updatedTask) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("task-update-event", updatedTask, user.id || user._id);
        } else {
            console.warn("Socket is not connected.");
        }
    };

    // Emits an event when a new task is created, alerting other users
    const notifyTaskCreated = (newTask) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("task-created-event", newTask, user.id || user._id);
        } else {
            console.warn("Socket is not connected.");
        }
    };

    // Emits event when a new comment is added, alerting other user
    const notifyCommentCreated = (commentObject) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("task-comment-event", commentObject);
        } else {
            console.warn("Socket is not connected.");
        }
    };

    // Checks for a connected socket before calling a callback, retrying every 100ms
    const waitForConnection = (callback, interval = 100) => {
        const checkConnection = setInterval(() => {
            if (socketRef.current && socketRef.current.connected) {
                clearInterval(checkConnection);
                callback();
            }
        }, interval);
    };

    useEffect(() => {
        // Only initialize socket if there is a valid user in a team
        if (!user || !user?.team) return;

        // Sets API base URL based on environment (local, staging, production)
        const mode = import.meta.env.VITE_MODE;

        // Create a new socket connection if none exists
        if (!socketRef.current) {
            const apiBaseUrl = mode !== 'production'
                ? window.location.hostname === "localhost"
                    ? import.meta.env.VITE_BACKEND_LOCALHOST_BASE
                    : import.meta.env.VITE_BACKEND_LOCAL_IP_BASE
                : import.meta.env.VITE_BACKEND_BASE;

            console.log("%c connecting to websocket", "background: hotpink; color: cyan; padding: 5px; ");

            socketRef.current = io(apiBaseUrl, {
                query: { userId: user.id, username: user.username, teamId: user.team._id },
                transports: ['websocket'],
                withCredentials: true
            });

            // Once connected, join the team room
            socketRef.current.on('connect', () => {
                waitForConnection(() => {
                    console.log("%c connection established", "background: #0dddac; color: #cd1cd1; padding: 5px; border-radius: 50px ");
                    socketRef.current.emit('joinTeamRoom', user.team._id);
                });
            });
        }

        // Define event handlers to manage socket responses and updates

        // Logs any messages sent from the server
        const handleMessages = (message) => {
            console.log(`%c ${message}`, "background: cyan; color: hotpink; padding: 3px");
        };

        // Updates the connected users list when someone joins the room
        const handleJoinedRoom = (data) => {
            setConnectedUsers(data?.users);
            console.log(`%c ${data.message}`, "background: lime; color: red; padding: 5px;");
        };

        // Updates a task, shows a toast notification about the change
        const handleTaskUpdatedByTeam = (data) => {
            const { task } = data;
            updateTask(task);

            let actionMessage = task.isDeleted
                ? "deleted"
                : task.isCompleted
                    ? "marked as completed"
                    : "updated";

            toast({
                title: "Task Updated",
                description: `Task "${task.title}" has been ${actionMessage}.`,
                status: "info",
                duration: 7000,
                isClosable: true,
            });
        };

        const handleNewComment = ({comment}) => {
            addCommentToTask(comment)
        };

        // Updates the connected users list when someone leaves the room
        const handleUserLeft = (data) => {
            console.log(data.users);
            setConnectedUsers(data.users);
        };

        // Handles socket connection errors by updating connection state and user list
        const handleConnectError = (err) => {
            console.error("Socket connection error:", err);
            const userId = user?.id || user?._id;

            setConnectedUsers((prevUsers) =>
                prevUsers.filter((connectedUserId) => connectedUserId !== userId)
            );
        };

        // Attach all necessary socket event listeners
        socketRef.current.on('message', handleMessages);
        socketRef.current.on('joinedRoom', handleJoinedRoom);
        socketRef.current.on('taskUpdatedByTeam', handleTaskUpdatedByTeam);
        socketRef.current.on('userLeft', handleUserLeft);
        socketRef.current.on('connect_error', handleConnectError);
        socketRef.current.on('newCommentAdded', handleNewComment);

        // Cleanup on component unmount: remove listeners and disconnect socket
        return () => {
            if (socketRef.current) {
                socketRef.current.off('message', handleMessages);
                socketRef.current.off('joinedRoom', handleJoinedRoom);
                socketRef.current.off('taskUpdatedByTeam', handleTaskUpdatedByTeam);
                socketRef.current.off('userLeft', handleUserLeft);
                socketRef.current.off('connect_error', handleConnectError);
                socketRef.current.off('newComment', handleNewComment);

                socketRef.current.disconnect();
            }
        };
    }, [user]);

    // Return socket instance and notification functions for use in the component
    return { socket: socketRef.current, notifyTaskUpdate, notifyTaskCreated, notifyCommentCreated };
};

export default useSocket;

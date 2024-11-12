import { useToast } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (user, setConnected, setConnectedUsers, updateTask) => {
    // Reference to store the socket instance, using useRef to keep it persistent across re-renders
    const socketRef = useRef(null);
    const toast = useToast();

    // Notify function to emit task updates
    const notifyTaskUpdate = (updatedTask) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("task-update-event", updatedTask, user.id || user._id);
        } else {
            console.warn("Socket is not connected.");
        }
    };

    // Notify function to emit task updates
    const notifyTaskCreated = (newTask) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("task-created-event", newTask, user.id || user._id);
        } else {
            console.warn("Socket is not connected.");
        }
    };

    // Function to wait until the socket connection is established before running a callback
    const waitForConnection = (callback, interval = 100) => {
        const checkConnection = setInterval(() => {
            // Check if socket is connected, then clear interval and execute callback
            if (socketRef.current && socketRef.current.connected) {
                clearInterval(checkConnection);
                callback();
            }
        }, interval);
    };

    // handle socket setup and teardown
    useEffect(() => {

        // Exit the hook if there's no user or user doesn't belong to a team
        if (!user || !user?.team) return;

        // Check the environment mode
        const mode = import.meta.env.VITE_MODE;

        // Initialize socket if it hasn't been created yet
        if (!socketRef.current) {
            // Use localhost in non-production modes, otherwise, use the environment backend URL
            const apiBaseUrl = mode !== 'production'
                ? window.location.hostname === "localhost"
                    ? import.meta.env.VITE_BACKEND_LOCALHOST_BASE
                    : import.meta.env.VITE_BACKEND_LOCAL_IP_BASE
                : import.meta.env.VITE_BACKEND_BASE;

            console.log("%c connecting to websocket", "background: hotpink; color: cyan; padding: 5px; ");

            // Create the socket connection with user data and configuration options
            socketRef.current = io(apiBaseUrl, {
                query: { userId: user.id, username: user.username, teamId: user.team._id },
                transports: ['websocket'],
                withCredentials: true
            });

            // Listen for the 'connect' event to confirm connection
            socketRef.current.on('connect', () => {
                // Wait for socket to be fully connected, then log confirmation
                waitForConnection(() => {
                    console.log("%c connection established", "background: #0dddac; color: #cd1cd1; padding: 5px; border-radius: 50px ");
                    socketRef.current.emit('joinTeamRoom', user.team._id);
                });
            });
        }

        // Set up listener for 'message' events and log any incoming messages
        socketRef.current.on('message', (message) => {
            console.log(`%c ${message}`, "background: cyan; color: hotpink; padding: 3px");
        });

        socketRef.current.on('joinedRoom', (data) => {
            const joinedUser = data.userId;
            const currentUser = user._id;
            setConnectedUsers(data?.users)
            if (joinedUser === currentUser) {
                setConnected(true);
            }
            console.log(`%c ${data.message}`, "background: lime; color: red; padding: 5px;");
        });

        socketRef.current.on('taskUpdatedByTeam', (data) => {
            const { task } = data;

            updateTask(task);

            let actionMessage;
            if (task.isDeleted) {
                actionMessage = "deleted";
            } else if (task.isCompleted) {
                actionMessage = "marked as completed";
            } else {
                actionMessage = "updated";
            }

            toast({
                title: "Task Updated",
                description: `Task "${task.title}" has been ${actionMessage}.`,
                status: "info",
                duration: 7000,
                isClosable: true,
            });
        });


        socketRef.current.on('userLeft', (data) => {
            console.log(data.users);
            setConnectedUsers(data.users)
        });

        socketRef.current.on('connect_error', (err) => {
            console.error("Socket connection error:", err);
        });

        // Cleanup function to disconnect socket when the component using this hook unmounts
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user]);  // Dependency on the user prop

    // Return the socket instance to be used in other parts of the application
    return { socket: socketRef.current, notifyTaskUpdate, notifyTaskCreated };
};

export default useSocket;

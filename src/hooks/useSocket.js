import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (taskId, isTaskShared, onTaskUpdated, user, onJoinedRoom) => {
    const socketRef = useRef(null);

    const waitForConnection = (callback, interval = 100) => {
        const checkConnection = setInterval(() => {
            if (socketRef.current && socketRef.current.connected) {
                clearInterval(checkConnection);
                callback();
            }
        }, interval);
    };

    useEffect(() => {
        // Establish the WebSocket connection
        if (!socketRef.current) {
            const apiBaseUrl = window.location.hostname === 'localhost'
                ? "http://localhost:5000"
                : "http://192.168.0.41:5000";

            console.log("%c connecting to websocket", "color: cyan");
            socketRef.current = io(apiBaseUrl, {
                query: { userId: user.id, username: user.username },
                transports: ['websocket'],
                withCredentials: true
            });

            // Always listen for the 'connect' event to know when the connection is ready
            socketRef.current.on('connect', () => {
                waitForConnection(() => {
                    if (taskId && isTaskShared) {
                        console.log("%c established connection", "color: hotpink");
                        socketRef.current.emit('joinTaskRoom', taskId);
                    }
                });
            });
        }

        // Remove old event listeners before re-adding them to avoid stacking
        if (socketRef.current) {
            socketRef.current.off('joinedRoom');
            socketRef.current.off('leftRoom');
            socketRef.current.off('taskUpdated');
        }

        // If already connected, join the room right away
        if (taskId && isTaskShared && socketRef.current?.connected) {
            waitForConnection(() => {
                console.log("%c established connection", "color: hotpink");
                socketRef.current.emit('joinTaskRoom', taskId);
            });
        }

        // Listen for user-related events
        socketRef.current.on('message', (message) => {
            console.log(`%c ${message}`, "background: cyan; color: hotpink; padding: 3px");
        });

        // Listen for room-related events
        socketRef.current.on('joinedRoom', ({ taskId, message }) => {
            console.log(message);
            if (onJoinedRoom) {
                onJoinedRoom(taskId);
            }
        });

        socketRef.current.on('leftRoom', ({ taskId, message }) => {
            console.log(message);
        });

        // Listen for taskUpdated event (specific to this task)
        socketRef.current.on('taskUpdated', (updatedTask) => {
            console.log(updatedTask);
            if (onTaskUpdated) {
                onTaskUpdated(updatedTask);
            }
        });

        // Cleanup on component unmount or task change
        return () => {
            if (taskId && isTaskShared) {
                socketRef.current.emit('leaveTaskRoom', taskId);  // Leave the room on unmount
            }

            if (socketRef.current) {
                // Clean up all listeners on unmount
                socketRef.current.off('taskUpdated');
                socketRef.current.off('joinedRoom');
                socketRef.current.off('leftRoom');
            }
        };
    }, [taskId, isTaskShared, onTaskUpdated]);

    const updateTask = (updatedTask) => {
        if (socketRef.current) {
            const taskToEmit = { ...updatedTask, taskPosition: [] };
            socketRef.current.emit('taskUpdated', taskToEmit);
        }
    };

    return { socket: socketRef.current, updateTask };
};

export default useSocket;

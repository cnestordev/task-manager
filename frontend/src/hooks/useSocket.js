import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = (user, setConnected) => {
    // Reference to store the socket instance, using useRef to keep it persistent across re-renders
    const socketRef = useRef(null);

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
                ? "http://localhost:3000"
                : import.meta.env.VITE_BACKEND_BASE;

            console.log("%c connecting to websocket", "background: hotpink; color: cyan; padding: 5px; ");

            console.log(user);
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
            if (joinedUser === currentUser) {
                setConnected(true);
            }
            console.log(`%c ${data.message}`, "background: lime; color: red; padding: 5px;");
        });


        socketRef.current.on('userLeft', (data) => {
            console.log(data);
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
    return { socket: socketRef.current };
};

export default useSocket;

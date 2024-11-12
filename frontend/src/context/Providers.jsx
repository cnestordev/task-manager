import { UserProvider } from "./UserContext";
import { TaskProvider } from "./TaskContext";
import { LoadingProvider } from "./LoadingContext";
import { SocketProvider } from "./SocketContext";

const Providers = ({ children }) => {
  return (
    <LoadingProvider>
      <UserProvider>
        <TaskProvider>
          <SocketProvider>{children}</SocketProvider>
        </TaskProvider>
      </UserProvider>
    </LoadingProvider>
  );
};

export default Providers;

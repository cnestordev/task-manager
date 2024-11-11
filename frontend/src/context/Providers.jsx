import { UserProvider } from "./UserContext";
import { TaskProvider } from "./TaskContext";
import { LoadingProvider } from "./LoadingContext";
import { SocketProvider } from "./SocketContext";

const Providers = ({ children }) => {
  return (
    <LoadingProvider>
      <UserProvider>
        <SocketProvider>
          <TaskProvider>{children}</TaskProvider>
        </SocketProvider>
      </UserProvider>
    </LoadingProvider>
  );
};

export default Providers;

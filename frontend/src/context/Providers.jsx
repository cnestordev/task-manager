import { UserProvider } from "./UserContext";
import { TaskProvider } from "./TaskContext";
import { LoadingProvider } from "./LoadingContext";
import { SocketProvider } from "./SocketContext";
import { ImageProvider } from "./ImageContext";

const Providers = ({ children }) => {
  return (
    <LoadingProvider>
      <UserProvider>
        <TaskProvider>
          <SocketProvider>
            <ImageProvider>{children}</ImageProvider>
          </SocketProvider>
        </TaskProvider>
      </UserProvider>
    </LoadingProvider>
  );
};

export default Providers;

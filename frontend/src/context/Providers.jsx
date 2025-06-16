import { UserProvider } from "./UserContext";
import { TaskProvider } from "./TaskContext";
import { LoadingProvider } from "./LoadingContext";
import { SocketProvider } from "./SocketContext";
import { ImageProvider } from "./ImageContext";
import { CommentProvider } from "./CommentContext"; // 👈 import it

const Providers = ({ children }) => {
  return (
    <LoadingProvider>
      <UserProvider>
        <TaskProvider>
          <SocketProvider>
            <ImageProvider>
              <CommentProvider>
                {children}
              </CommentProvider>
            </ImageProvider>
          </SocketProvider>
        </TaskProvider>
      </UserProvider>
    </LoadingProvider>
  );
};

export default Providers;
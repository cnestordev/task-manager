import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Box,
  HStack,
  SkeletonCircle,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";

export const StatusIndicator = ({
  user,
  className,
  assignedTo,
  isExpanded,
}) => {
  const statusColors = {
    online: "green.500",
    offline: "gray.500",
  };

  const userId = user?._id || user?.id;
  const { connectedUsers } = useSocketContext();

  // Convert connectedUsers to a Set for efficient lookup
  const connectedUsersSet = new Set(connectedUsers);

  // Access the team assets
  const userAssets = user?.team?.assets || {};

  const [sortedAssignedTo, setSortedAssignedTo] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState({});

  useEffect(() => {
    // Prioritize current user in the assignedTo list
    const updatedAssignedTo = userId
      ? [userId, ...assignedTo.filter((id) => id !== userId)]
      : assignedTo;
    setSortedAssignedTo(updatedAssignedTo);
  }, [assignedTo, userId]);

  useEffect(() => {
    // Preload images and track loading state
    sortedAssignedTo.forEach((id) => {
      const imageUrl = userAssets[id] || "/default-avatar.png";
      const img = new Image();

      img.src = imageUrl;
      setImageLoadingState((prev) => ({ ...prev, [id]: "loading" }));

      img.onload = () => {
        setImageLoadingState((prev) => ({ ...prev, [id]: "loaded" }));
      };
      img.onerror = () => {
        setImageLoadingState((prev) => ({ ...prev, [id]: "error" }));
      };
    });
  }, [sortedAssignedTo, userAssets]);

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        {!isExpanded ? (
          <AvatarGroup>
            {sortedAssignedTo.map((id) =>
              imageLoadingState[id] === "loading" ? (
                <SkeletonCircle key={id} size="10" />
              ) : (
                <Avatar
                  border="1px solid #cfcfcf"
                  src={userAssets[id] || "/default-avatar.png"}
                  key={id}
                  size="sm"
                >
                  {connectedUsersSet.has(id) ? (
                    <AvatarBadge boxSize="1em" bg={statusColors.online} />
                  ) : (
                    <AvatarBadge boxSize="1em" bg={statusColors.offline} />
                  )}
                </Avatar>
              )
            )}
          </AvatarGroup>
        ) : (
          <Box display="flex" gap={1.5}>
            {sortedAssignedTo.map((id) => (
              <Avatar
                border="1px solid #cfcfcf"
                src={userAssets[id] || "/default-avatar.png"}
                key={id}
                size="sm"
              >
                {connectedUsersSet.has(id) ? (
                  <AvatarBadge boxSize="1em" bg={statusColors.online} />
                ) : (
                  <AvatarBadge boxSize="1em" bg={statusColors.offline} />
                )}
              </Avatar>
            ))}
          </Box>
        )}
      </HStack>
    </div>
  );
};

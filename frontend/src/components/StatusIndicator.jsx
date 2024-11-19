import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Box,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useImageContext } from "../context/ImageContext";

export const StatusIndicator = ({
  user,
  nameofClass,
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

  // Access the preloaded images from ImageContext
  const { images } = useImageContext();

  const [sortedAssignedTo, setSortedAssignedTo] = useState([]);

  useEffect(() => {
    // Prioritize current user in the assignedTo list
    const updatedAssignedTo = userId
      ? [userId, ...assignedTo.filter((id) => id !== userId)]
      : assignedTo;
    setSortedAssignedTo(updatedAssignedTo);
  }, [assignedTo, userId]);

  return (
    <div className={`status-container ${nameofClass}`}>
      <HStack spacing={2} alignItems="center">
        {!isExpanded ? (
          <AvatarGroup>
            {sortedAssignedTo.map((id) => {
              const memberImage = images[id];
              const isImageLoaded = memberImage && memberImage.complete;
              const imageUrl = isImageLoaded
                ? memberImage.src
                : "/default-avatar.png";
              return (
                <Avatar key={id} src={imageUrl} size="sm">
                  {connectedUsersSet.has(id) ? (
                    <AvatarBadge boxSize="1em" bg={statusColors.online} />
                  ) : (
                    <AvatarBadge boxSize="1em" bg={statusColors.offline} />
                  )}
                </Avatar>
              );
            })}
          </AvatarGroup>
        ) : (
          <Box display="flex" gap={1}>
            {sortedAssignedTo.map((id) => {
              const memberImage = images[id];
              const isImageLoaded = memberImage && memberImage.complete;
              const imageUrl = isImageLoaded
                ? memberImage.src
                : "/default-avatar.png";
              return (
                <Box key={id} position="relative">
                  <Avatar src={imageUrl} size="sm">
                    {connectedUsersSet.has(id) ? (
                      <AvatarBadge boxSize="1em" bg={statusColors.online} />
                    ) : (
                      <AvatarBadge boxSize="1em" bg={statusColors.offline} />
                    )}
                  </Avatar>
                </Box>
              );
            })}
          </Box>
        )}
      </HStack>
    </div>
  );
};

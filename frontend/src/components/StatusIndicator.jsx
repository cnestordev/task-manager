import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Box,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";
import { useSocketContext } from "../context/SocketContext";

export const StatusIndicator = ({
  user,
  status,
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

  const [validatedAvatars, setValidatedAvatars] = useState({});
  const [sortedAssignedTo, setSortedAssignedTo] = useState([]);

  useEffect(() => {
    // Prioritize current user in the assignedTo list
    const updatedAssignedTo = userId
      ? [userId, ...assignedTo.filter((id) => id !== userId)]
      : assignedTo;
    setSortedAssignedTo(updatedAssignedTo);

    // Fetch avatar URLs and validate their existence
    const fetchAvatars = async () => {
      const avatars = {};
      await Promise.all(
        updatedAssignedTo.map(async (id) => {
          const cloudinaryUrl = getCloudinaryAvatarUrl(id);
          try {
            const response = await fetch(cloudinaryUrl, { method: "HEAD" });
            avatars[id] = response.ok ? cloudinaryUrl : null;
          } catch (error) {
            console.error(`Image check failed for user ${id}:`, error);
            avatars[id] = null;
          }
        })
      );
      setValidatedAvatars(avatars);
    };

    fetchAvatars();
  }, [assignedTo, userId]);

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        {!isExpanded ? (
          <AvatarGroup>
            {sortedAssignedTo.map((id, index) => (
              <Avatar
                border="1px solid #cfcfcf"
                src={validatedAvatars[id]}
                key={id}
                size="sm"
              >
                {connectedUsers.includes(id) ? (
                  <AvatarBadge boxSize="1em" bg="green.500" />
                ) : (
                  <AvatarBadge boxSize="1em" bg="gray.500" />
                )}
              </Avatar>
            ))}
          </AvatarGroup>
        ) : (
          <Box display="flex" gap={1.5}>
            {sortedAssignedTo.map((id, index) => (
              <Avatar
                border="1px solid #cfcfcf"
                src={validatedAvatars[id]}
                key={id}
                size="sm"
              >
                {connectedUsers.includes(id) ? (
                  <AvatarBadge boxSize="1em" bg="green.500" />
                ) : (
                  <AvatarBadge boxSize="1em" bg="gray.500" />
                )}
              </Avatar>
            ))}
          </Box>
        )}
      </HStack>
    </div>
  );
};

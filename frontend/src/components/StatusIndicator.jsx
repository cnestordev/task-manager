import { Avatar, AvatarBadge, AvatarGroup, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getCloudinaryAvatarUrl } from "../utils/getCloudinaryAvatarUrl";

export const StatusIndicator = ({ user, status, className, assignedTo }) => {
  const statusColors = {
    online: "green.500",
    offline: "gray.500",
  };

  const userId = user?._id || user?.id;

  const [validatedAvatars, setValidatedAvatars] = useState({});
  const [sortedAssignedTo, setSortedAssignedTo] = useState([]);

  useEffect(() => {
    // check user id
    const updatedAssignedTo = userId
      ? [userId, ...assignedTo.filter((id) => id !== userId)]
      : assignedTo;
    setSortedAssignedTo(updatedAssignedTo);

    const checkAvatarExists = async (user) => {
      const cloudinaryUrl = getCloudinaryAvatarUrl(user);
      try {
        const response = await fetch(cloudinaryUrl, { method: "HEAD" });
        if (response.ok) {
          return cloudinaryUrl;
        } else {
          return null;
        }
      } catch (error) {
        console.error(`Image check failed for user ${user}:`, error);
        return null;
      }
    };

    // Check each user's avatar
    updatedAssignedTo.forEach((user) => {
      checkAvatarExists(user).then((url) => {
        setValidatedAvatars((prevAvatars) => ({
          ...prevAvatars,
          [user]: url,
        }));
      });
    });
  }, [assignedTo, userId]);

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        <AvatarGroup>
          {sortedAssignedTo.map((user, index) => (
            <Avatar border="1px solid #cfcfcf" src={validatedAvatars[user]} key={user} size="sm">
              {index === 0 && (
                <AvatarBadge
                  boxSize="1.25em"
                  bg={statusColors[status] || "gray.500"}
                />
              )}
            </Avatar>
          ))}
        </AvatarGroup>
      </HStack>
    </div>
  );
};

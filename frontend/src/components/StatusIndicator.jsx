import { Avatar, AvatarBadge, AvatarGroup, HStack } from "@chakra-ui/react";

export const StatusIndicator = ({ status, className, assignedToLength }) => {
  const statusColors = {
    online: "green.500",
    offline: "gray.500",
  };

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        <AvatarGroup>
          {Array.from({ length: assignedToLength }, (_, index) => (
            <Avatar key={index} size="xs">
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

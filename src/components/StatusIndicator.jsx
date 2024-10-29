import { Avatar, AvatarBadge, AvatarGroup, HStack } from "@chakra-ui/react";

export const StatusIndicator = ({ status, className }) => {
  const statusColors = {
    online: "green.500",
    offline: "gray.500",
  };

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        <AvatarGroup>
          <Avatar size="xs">
            <AvatarBadge boxSize="1.25em" bg="green.500" />
          </Avatar>
          <Avatar size="xs" />
        </AvatarGroup>
      </HStack>
    </div>
  );
};

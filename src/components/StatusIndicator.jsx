import { Box, HStack } from "@chakra-ui/react";

export const StatusIndicator = ({ status, className }) => {
  console.log(className);

  const statusColors = {
    online: "green.500",
    offline: "gray.500",
  };

  return (
    <div className={`status-container ${className}`}>
      <HStack spacing={2} alignItems="center">
        <Box
          boxSize="10px"
          bg={statusColors[status] || "gray.500"}
          borderRadius="full"
        />
      </HStack>
    </div>
  );
};

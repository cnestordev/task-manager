import {
  Avatar,
  Badge,
  Box,
  Flex,
  Heading,
  IconButton,
  Spinner,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { editInviteCode, getTeamDetails, removeMember } from "../api";
import { useUser } from "../context/UserContext";
import CustomizeInviteCodeModal from "./CustomizeInviteCodeModal";

const AdminDashboard = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const { user, updateUser } = useUser();
  const darkMode = user?.darkMode || false;

  // Fetch team details on component mount
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const data = await getTeamDetails();
        setTeam(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load team information",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTeamDetails();
  }, []);

  // Remove team member
  const handleRemoveMember = async (memberId) => {
    try {
      const response = await removeMember(memberId);
      if (response.team === null) {
        updateUser({
          ...user,
          team: null,
        });
      }
      setTeam((prevTeam) => ({
        ...prevTeam,
        members: prevTeam.members.filter((member) => member._id !== memberId),
      }));
      toast({
        title: "Member Removed",
        description: "The member has been successfully removed from the team.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveInviteCode = async (newCode) => {
    try {
      const response = await editInviteCode({
        inviteCode: newCode,
        teamId: team.id,
      });

      const newInviteCode = response.data.inviteCode;
      const message = response.data.message;

      setTeam((prevTeam) => ({
        ...prevTeam,
        inviteCode: newInviteCode,
      }));

      toast({
        title: message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessage =
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : "An error occurred while updating the invite code. Please try again.";

      // Error toast message
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) return <Spinner size="xl" color="blue.500" />;

  return (
    <Box mx="auto" width={["100%", "50%"]} borderRadius="md">
      <Heading
        as="h2"
        size="lg"
        mb={6}
        textAlign="center"
        color={darkMode ? "white" : "gray.700"}
      >
        Admin Dashboard
      </Heading>

      {/* Team Information */}
      <Box
        p={4}
        borderRadius="20"
        padding="35px"
        bg="transparent"
        mb={6}
        textAlign="center"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Box mb={2}>
          <Text fontSize="24px" fontWeight="bold">
            {team?.name || "No Team Name"}
          </Text>
          <Text fontSize="14px" color="gray.500">
            Team Name
          </Text>
        </Box>
        <Flex
          bgColor={darkMode ? "#2a3745" : "#f1f5fb"}
          padding="15px"
          borderRadius="10"
          width={["100%", "90%", "50%"]}
          alignItems="center"
          justifyContent="center"
          mt={2}
        >
          <Box>
            <Text fontSize="20px" fontWeight="bold">
              {team?.inviteCode || "N/A"}
            </Text>
            <Text mb={2} fontSize="13px" color="gray.500">
              Invite Code
            </Text>
            <CustomizeInviteCodeModal
              currentCode={team?.inviteCode || ""}
              onSave={handleSaveInviteCode}
            />
          </Box>
        </Flex>
      </Box>

      {/* Team Members */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.500">
          Team Members
        </Text>
        {team && team.members && team.members.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {team.members.map((member) => {
              // Check if team.assets and the specific member's avatar URL exist
              const cloudinaryUrl =
                user?.team?.assets?.[member._id] || "/default-avatar.png";
              return (
                <Flex
                  key={member._id}
                  alignItems="center"
                  justify="space-between"
                  p={3}
                  bg={darkMode ? "#2a3745" : "#f1f5fb"}
                  borderRadius="20"
                  padding="20px"
                  width="70%"
                  alignSelf="center"
                >
                  <Box
                    gap="3"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Avatar src={cloudinaryUrl} />
                    <Text flex="1" color="gray.500" fontWeight="medium">
                      {member.username}{" "}
                      {member._id === user.id && (
                        <Badge ml={2} colorScheme="purple">
                          Admin
                        </Badge>
                      )}
                    </Text>
                  </Box>
                  <IconButton
                    icon={<MdDelete />}
                    colorScheme="red"
                    variant="ghost"
                    aria-label="Remove member"
                    onClick={() => handleRemoveMember(member._id)}
                    fontSize="22px"
                  />
                </Flex>
              );
            })}
          </VStack>
        ) : (
          <Text color="gray.600">No members in the team</Text>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;

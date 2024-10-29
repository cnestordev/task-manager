import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  IconButton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { getTeamDetails, removeMember } from "../api";

const AdminDashboard = () => {
  const [team, setTeam] = useState();
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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
  }, [toast]);

  // Remove team member
  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(memberId);
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

  if (loading) return <Spinner size="xl" color="blue.500" />;

  return (
    <Box maxW="lg" mx="auto" p={6} boxShadow="lg" borderRadius="md" bg="white">
      <Heading as="h2" size="lg" mb={4} textAlign="center">
        Admin Dashboard
      </Heading>

      {/* Team Information */}
      <Box mb={6}>
        <Text fontSize="xl" fontWeight="bold">
          Team Name: {team.name}
        </Text>
        <Flex alignItems="center" mt={2}>
          <Text fontSize="md" fontWeight="bold" mr={2}>
            Invite Code:
          </Text>
          <Text fontSize="md">{team.inviteCode}</Text>
        </Flex>
      </Box>

      {/* Team Members */}
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Team Members:
        </Text>
        {team.members.length > 0 ? (
          team.members.map((member) => (
            <Flex
              key={member._id}
              alignItems="center"
              p={2}
              bg="gray.50"
              mb={2}
              borderRadius="md"
            >
              <Text flex="1">{member.username}</Text>
              <IconButton
                icon={<MdDelete />}
                colorScheme="red"
                aria-label="Remove member"
                onClick={() => handleRemoveMember(member._id)}
              />
            </Flex>
          ))
        ) : (
          <Text>No members in the team</Text>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
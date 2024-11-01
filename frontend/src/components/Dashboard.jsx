import { useUser } from "../context/UserContext";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";
import Navbar from "./Navbar";
import { NewTeamContainer } from "./NewTeamContainer";

const Dashboard = () => {
  const { user } = useUser();

  const isAdmin = user?.team && user.id === user.team.createdBy;
  const isMember = user?.team && user.id !== user.team.createdBy;

  return (
    <>
      <Navbar />
      {isAdmin && <AdminDashboard />}
      {isMember && <MemberDashboard />}
      {!user.team && <NewTeamContainer />}
    </>
  );
};

export default Dashboard;

// import AdminDashboard from "./AdminDashboard";
// import MemberDashboard from "./MemberDashboard";
// import CreateTeamDashboard from "./CreateTeamDashboard";

import CreateTeamDashboard from "./CreateTeamDashboard";

const Dashboard = ({ user }) => {

  const isAdmin = user?.team && user._id === user.team.createdBy;
  const isMember = user?.team && user._id !== user.team.createdBy;


  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.username}!</h1>
      <CreateTeamDashboard />
      {/* {isAdmin && (
        <>
          <h2>Admin Dashboard</h2>
          <AdminDashboard />
        </>
      )}
      {isMember && (
        <>
          <h2>Team Member Dashboard</h2>
          <MemberDashboard />
        </>
      )}
      {!user.team && (
        <>
          <h2>Create a Team</h2>
          <CreateTeamDashboard />
        </>
      )} */}
    </div>
  );
};

export default Dashboard;

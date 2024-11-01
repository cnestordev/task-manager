const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeam, validateInviteCode } = require('../middleware/validateTeam');

// Team Routes
router.get('/', teamController.getTeamDetails); // Get team details
router.post('/createTeam', validateTeam, teamController.createTeam); // Create a new team
router.post('/members/remove', teamController.removeMember); // Remove team member by ID
router.post('/join', teamController.joinTeam);
router.get('/allMembers', teamController.getTeamMembers);
router.post('/editInviteCode', validateInviteCode, teamController.editInviteCode);

module.exports = router;
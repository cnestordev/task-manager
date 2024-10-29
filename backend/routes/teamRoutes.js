const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { validateTeam } = require('../middleware/validateTeam');

// Team Routes
router.get('/', teamController.getTeamDetails); // Get team details
router.post('/createTeam', validateTeam, teamController.createTeam); // Create a new team
router.delete('/members/remove', teamController.removeMember); // Remove team member by ID
router.post('/join', teamController.joinTeam);

module.exports = router;
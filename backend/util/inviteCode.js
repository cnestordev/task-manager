const cryptoModule = require('crypto');

const generateInviteCode = () => {
    let inviteCode = '';
    while (inviteCode.length < 8) {
        inviteCode += cryptoModule.randomBytes(4).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    }
    return inviteCode.substring(0, 8);
};

module.exports = generateInviteCode;

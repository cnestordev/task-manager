const checkAuthentication = (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.status(401).json({ message: "User is not authenticated" });
        }
    } catch (err) {
        console.log("Error in checking auth", err);
    }
};

module.exports = checkAuthentication;

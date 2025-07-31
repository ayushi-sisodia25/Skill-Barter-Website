var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    req.logOut((error) => {
        if (error) throw error;
        req.flash("success_msg", "You have logged out");
        res.redirect("/users/login");
    });
});

module.exports = router;
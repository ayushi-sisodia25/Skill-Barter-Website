var express = require('express');
var router = express.Router();
const passport = require('passport');
const { checkAuthenticated } = require('../../api/authMiddleware');


router.get("/", checkAuthenticated, function(req, res, next) {
    res.render('login');
});

router.post("/", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {

            return res.redirect('/users/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            
            return res.redirect(`/users/${user.id}/dashboard`);
        });
    })(req, res, next);
});

module.exports = router;
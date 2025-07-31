var express = require('express');
var router = express.Router();

router.get("/", (req, res) => {
    const user = req.user;
    const user_id = user.id;
    res.render("chatroom", { user });
});

module.exports = router;
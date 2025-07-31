var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../../dbConfig');
const { checkAuthenticated } = require('../../api/authMiddleware');


router.get('/', checkAuthenticated, function (req, res) {
    res.render('signup');
});


router.post('/', async (req, res) => {
    let { name, email, password, password2 } = req.body;
    let errors = [];

    
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
    }

    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
    }

    if (errors.length > 0) {
        return res.render("signup", { errors });
    }

    try {
        
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

        if (result.rows.length > 0) {
            errors.push({ message: "User already exists" });
            return res.render("signup", { errors });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

    
        await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)`,
            [name, email, hashedPassword]
        );

        req.flash("success_msg", "You are now registered. Please login.");
        res.redirect("/users/login");

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).send("Something went wrong during registration.");
    }
});

module.exports = router;

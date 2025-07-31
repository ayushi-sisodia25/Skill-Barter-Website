var express = require('express');
var router = express.Router();
const { checkNotAuthenticated } = require('../../api/authMiddleware');
const {pool} = require("../../dbConfig");


router.get("/", checkNotAuthenticated, function(req, res) {
    const user = req.user;
    const currentUserId = user.id;

    
    pool.query(`SELECT 
                    u.id, 
                    u.name, 
                    u.user_desc, 
                    STRING_AGG(s.skill, ', ') AS skills_list -- <--- CHANGE HERE
                 FROM users u
                 LEFT JOIN skill s
                 ON u.id = s.user_id 
                 WHERE u.id <> $1
                 GROUP BY u.id, u.name, u.user_desc`, [currentUserId], (error, feedResults) => { 

        if (error) {
            console.error("Error fetching dashboard feed:", error);
            return res.status(500).send("Error loading dashboard feed.");
        }

        const rowValues = feedResults.rows.map(row => ({
            id: row.id,
            name: row.name,
            user_desc: row.user_desc,
           
            skill: row.skills_list, 
        }));

       
        pool.query(`SELECT skill FROM skill WHERE user_id = $1`, [currentUserId], (error, userSkillResults) => {
            let currentUserSkillValue = '';

            if (error) {
                console.error("Error fetching current user's skill:", error);
            } else if (userSkillResults.rows.length > 0) {
                
                currentUserSkillValue = userSkillResults.rows.map(row => row.skill).join(', '); 
            }

            res.render('dashboard', {
                user: user,
                rowValues: rowValues,
                currentUserSkill: currentUserSkillValue
            });
        });
    });
});
router.post("/skill", (req, res) => {
    const user_id = req.user.id;
    const skill = req.body.skill;
    const user_desc = req.body.user_desc;

    let errors = [];

    if (!skill || !user_desc) {
        errors.push({
            message: "Please enter all fields"
        });
        return res.render(`dashboard`, { errors, user: req.user, rowValues: [] }); 
    }

    pool.query(
        `INSERT INTO skill (user_id, skill) VALUES ($1, $2)`,
        [user_id, skill], (error, results) => {
            if (error) {
                console.error("Error inserting skill:", error); 
                req.flash('error', "Failed to add skill. Please try again.");
                return res.redirect(`/users/${user_id}/dashboard`); 
            }

            pool.query(`UPDATE users SET user_desc = $1 WHERE id = $2`, [user_desc, user_id], (error, results) => {
                if (error) {
                    console.error("Error updating user_desc:", error); 
                    req.flash('error', "Skill added, but failed to update description. Please try again.");
                    return res.redirect(`/users/${user_id}/dashboard`); 
                }

                req.flash('success_msg', "Your skill has been added and profile updated.");
                return res.redirect(`/users/${user_id}/dashboard`);
            });
        }
    );
});
module.exports = router;
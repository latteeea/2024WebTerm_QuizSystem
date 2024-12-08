const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getLeaderboard } = require('../controllers/authController');



const router = express.Router();

router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', signup);

router.get('/login', (req, res) => res.render('login'));
router.post('/login', login);

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/'); // 루트 페이지로 리다이렉트
    });
});

router.get('/', getLeaderboard);

router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

module.exports = router;

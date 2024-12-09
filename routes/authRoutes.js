const express = require('express');
const { signup, login, logout, getLeaderboard } = require('../controllers/authController');
const passport = require('passport');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// 회원가입
router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', signup);

// 로그인
router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            res.cookie('login_error', 'Invalid credentials', { maxAge: 5000 });
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            res.cookie('username', user.username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.redirect('/dashboard');
        });
    })(req, res, next);
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

// 대시보드
router.get('/dashboard', (req, res) => {
    const username = req.cookies.username || 'Guest';
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user, username });
});


// 루트 페이지
router.get('/', getLeaderboard);

module.exports = router;

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
        if (err) {
            console.error('Authentication Error:', err);
            return next(err);
        }
        if (!user) {
            console.log('Authentication Failed:', info);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login Error:', err);
                return next(err);
            }
            console.log('User Authenticated:', user);
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
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user });
});

// 루트 페이지
router.get('/', getLeaderboard);

module.exports = router;

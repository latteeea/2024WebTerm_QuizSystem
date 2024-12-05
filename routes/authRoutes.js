const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// 회원가입 페이지로 이동
router.get('/signup', (req, res) => {
    res.render('signup'); // signup.ejs로 렌더링
});

// 로그인 페이지로 이동
router.get('/login', (req, res) => {
    res.render('login'); // login.ejs로 렌더링
});
router.post('/login', authController.login);

// 로그아웃 처리
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('로그아웃 오류');
        }
        res.redirect('/auth/login'); // 로그아웃 후 로그인 페이지로 리디렉션
    });
});

module.exports = router;

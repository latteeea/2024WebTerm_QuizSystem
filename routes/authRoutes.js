// authRoutes.js
// 사용자 인증 및 관련 경로 설정
// - 회원가입, 로그인, 로그아웃, 대시보드 라우트 정의
// - Passport.js를 통한 인증 처리


const express = require('express');
const { signup, login, logout, getLeaderboard } = require('../controllers/authController');
const passport = require('passport');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// 회원가입 페이지 렌더링 및 처리
router.get('/signup', (req, res) => res.render('signup'));
router.post('/signup', signup);

// 로그인 페이지 렌더링 및 처리
router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            // 사용자 인증 실패 시 쿠키에 에러 메시지 저장 후 로그인 페이지 리다이렉트
            res.cookie('login_error', 'Invalid credentials', { maxAge: 5000 });
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            // 인증 성공 시 사용자 이름을 쿠키에 저자아고 대시보드로 리다이렉트
            res.cookie('username', user.username, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.redirect('/dashboard');
        });
    })(req, res, next);  // passport 인증 호출
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout Error:', err);
            return res.redirect('/dashboard');
        }
        res.redirect('/');  // 로그아웃 성공 시 메인 페이지로 리다이렉트
    });
});

// 대시보드
router.get('/dashboard', (req, res) => {
    const username = req.cookies.username || 'Guest';  // 쿠키에서 사용자 이름 가져오기
    if (!req.isAuthenticated()) {
        return res.redirect('/login');  // 인증되지 않은 경우 로그인 페이지 리다이렉트
    }
    res.render('dashboard', { user: req.user, username });  // 대시보드 템플릿 렌더링
});


// 루트 페이지
router.get('/', getLeaderboard);

module.exports = router;

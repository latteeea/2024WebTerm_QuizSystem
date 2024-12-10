// app.js
// 애플리케이션 초기화 및 서버 설정
// - Express 애플리케이션 생성 및 미들웨어 설정
// - 인증 및 퀴즈 관련 라우트 연결
// - Nunjucks 템플릿 엔진 설정 및 정적 파일 제공


const express = require('express');  //express 프레임워크 사용
const session = require('express-session');  // 세션 관리 미들웨어
const authRoutes = require('./routes/authRoutes');  // 인증 관련 라우터
const nunjucks = require('nunjucks');  // nunjucks 템플릿 엔진 설정
const path = require('path');
const quizRoutes = require('./routes/quizRoutes');  // 퀴즈 관련 라우터
const passport = require('./passport/passport');  // passport.js 인증 설정
const flash = require('connect-flash');  // Flash 메시지 관리

const app = express();  // express 애플리케이션 생성

const cookieParser = require('cookie-parser');  // 쿠키 관리 미들웨어
app.use(cookieParser());  // 쿠키 파서 등록



app.use(flash());
app.use(express.json());  // JSON 요청 본문 처리 미들웨어

// 세션 관리 설정
app.use(session({
    secret: 'taeran',  // 세션 암호화 키
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());  // Passport 초기화
app.use(passport.session());  // Passport 세션 관리


// Nunjucks 템플릿 엔진 설정
nunjucks.configure('views', {
    autoescape: true,
    express: app,  // express 와 통합
    noCache: true,
});

app.set('view engine', 'html');

// Middleware 설정
app.use(express.urlencoded({ extended: false }));

// 모든 요청 로깅 미들웨어
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 등록
app.use('/', authRoutes);
app.use('/quiz', quizRoutes);

app.get('/dashboard', (req, res) => {
    console.log('User:', req.user);  // 현재 사용자 정보 로깅
    if (!req.isAuthenticated()) {  // 인증되지 않은 경우 로그인 페이지 이동
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user });  // 대시보드 페이지 렌더링
});


app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to the Quiz System!' });
});

// 서버 시작
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

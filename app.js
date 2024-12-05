
// .env 파일 로드 (dotenv 패키지 사용)
require('dotenv').config();
const db = require('./db');

const dbHost = process.env["DB_HOST "];
const dbUser = process.env["DB_USER "];
const dbPassword = process.env["DB_PASSWORD "];
const dbName = process.env["DB_NAME "];
const port = process.env["PORT "];

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');

const app = express();
app.set('port', port || 3000);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express : app,
    watch : true,
});

// 미들웨어 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// 라우터 설정
app.get('/', (req, res) => {
    res.render('index'); // index.ejs를 렌더링
});

app.use('/auth',authRoutes);  // 로그인 및 회원가입 관련 라우터

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser(cookieParser()));
app.use(session({
    resave : false,
    saveUninitialized : true,
    secret : cookieParser(),
    cookie : {
        httpOnly : true,
        secure : false,
    },
}));

// 로그인 상태 확인 미들웨어
const authenticateSession = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // 로그인되지 않은 경우 로그인 페이지로 리디렉션
    }
    next(); // 로그인된 경우, 다음 미들웨어나 라우트로 이동
};

// 대시보드 페이지
app.get('/dashboard', authenticateSession, (req, res) => {
    res.render('dashboard', { user: req.session.user }); // 세션에 저장된 사용자 정보 전달
});

app.listen(3000, () => {
    console.log('서버가 실행중입니다.');
})



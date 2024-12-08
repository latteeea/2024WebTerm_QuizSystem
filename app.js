const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const nunjucks = require('nunjucks');
const path = require('path');

const app = express();

// Nunjucks 설정
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true,
});

app.set('view engine', 'html');

// Middleware 설정
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// 정적 파일 경로
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 등록
app.use('/', authRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to the Quiz System!' });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

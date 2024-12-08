const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const nunjucks = require('nunjucks');
const path = require('path');
const quizRoutes = require('./routes/quizRoutes');
const passport = require('./passport/passport');
const flash = require('connect-flash');



const app = express();

app.use(flash());

app.use(session({
    secret: 'taeran',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// Nunjucks 설정
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true,
});

app.set('view engine', 'html');

// Middleware 설정
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});


// 정적 파일 경로
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 등록
app.use('/', authRoutes);

app.use('/quiz', quizRoutes);

app.get('/dashboard', (req, res) => {
    console.log('User:', req.user);
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.user });
});




app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to the Quiz System!' });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

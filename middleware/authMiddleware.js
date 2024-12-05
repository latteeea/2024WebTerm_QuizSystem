const jwt = require('jsonwebtoken');

// 인증 미들웨어
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: '토큰이 필요합니다.' });
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: '잘못된 토큰입니다.' });
        }
        req.userId = decoded.userId;
        next();
    });
};

const jwt = require('jsonwebtoken')

const isAuthenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if(token == null) return res.status(401).send({error: true, message: 'Authentication failed'})
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (err, user) => {
        if(err) return res.status(401).send({error: true, message: String(err)});
        req.user = user;
        next();
    })
}

module.exports = isAuthenticate
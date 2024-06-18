const jwt = require('jsonwebtoken');

module.exports = function getUser(token) {
    return  jwt.verify(token, process.env.ACCESS_TOKEN_KEY);     
    
 };
 
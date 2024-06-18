require('dotenv').config();
var express = require('express');
const app = express();
const jwt = require("jsonwebtoken");


const generateAccessToken = (req, res) => {
    const accessToken = jwt.sign(req, process.env.ACCESS_TOKEN_KEY,{expiresIn:"30d"});
    return accessToken;
}

module.exports = generateAccessToken;
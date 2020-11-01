const jwt = require('jsonwebtoken');
const KEYS = require('../config/keys');

module.exports = async (req, res, next) => {
    console.log(req.session.jwt);
    if(!req.session.jwt){
        return next();
    }
    try {
        const payload = jwt.verify(req.session.jwt,KEYS.jwtSecret);
        console.log(payload);
        req.currentUser = payload;
    }catch(err){
        return res.send(err);
    }
    next();
}
module.exports = (req, res, next) => {
    if(!req.currentUser) {
        res.send('Require Authentication');
    }
    next();
}
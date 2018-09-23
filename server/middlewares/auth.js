const jwt = require('jsonwebtoken');

/**
 * Validate Token
 */
let validateToken = (req, res, next) => {
    let token = req.get('Authorization') ? req.get('Authorization').split(' ')[1] : '';

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                reason: err
            });
        }

        req.user = decoded.user;

        next();
    });

};

/**
 * Validate User admin role
 */
let isUserAdmin = (req, res, next) => {
    let user = req.user;
    if (user.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            status: false,
            reason: 'Unauthorized request'
        });
    }

    next();
};

/**
 * Validate Image Token
 */
let validateImageToken = (req, res, next) => {
    let token = req.query.Authorization ? req.query.Authorization.split(' ')[1] : '';

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                reason: err
            });
        }

        req.user = decoded.user;

        next();
    });

};

module.exports = {
    validateToken,
    isUserAdmin,
    validateImageToken
}
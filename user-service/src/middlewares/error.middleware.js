const {AppError} = require('../utils/error');

const errorHandler = (err, req, res, next) => {
    if(err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.code,
            message: err.message
        });
    }
    console.error("UNHANDLED ERROR: ", err);
};

module.exports = errorHandler;
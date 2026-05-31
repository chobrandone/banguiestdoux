const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  /* Log in development */
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err.stack);
  }

  /* Mongoose bad ObjectId */
  if (err.name === 'CastError') {
    error = { statusCode: 404, message: 'Ressource introuvable' };
  }

  /* Mongoose duplicate key */
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = { statusCode: 400, message: `${field} déjà utilisé` };
  }

  /* Mongoose validation error */
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join('. ');
    error = { statusCode: 400, message };
  }

  /* JWT errors */
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Token invalide' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Token expiré' };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

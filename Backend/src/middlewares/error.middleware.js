const errorMiddleware = (err, req, res, next) => {
  console.error('❌ [ERROR LOG]:', err);

  const statusCode = err.statusCode || 500;

  const message = err.message || 'Lỗi hệ thống (Internal Server Error)';

  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
};

export default errorMiddleware;
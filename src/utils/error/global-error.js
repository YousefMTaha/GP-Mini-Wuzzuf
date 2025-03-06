export const globalError = (error, req, res, next) => {
  console.log(error);

  return res.status(error.cause || 500).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
};

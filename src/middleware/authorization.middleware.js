export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new Error("not authorized!", { cause: 401 }));
    return next();
  };
};

export const notFound = (req, res, next) => {
  return next(new Error("invalid url", { cause: 404 }));
};

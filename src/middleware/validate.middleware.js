import APiError from "../util/ApiError.js";

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errorMessage = result.error.issues
      .map((err) => err.message)
      .join(", ");

    return next(new APiError(400, errorMessage));
  }
  
  req.body = result.data.body;  
  Object.assign(req.query, result.data.query ?? {});
  Object.assign(req.params, result.data.params ?? {}); 
  next();
};

export default validateRequest;

import APiError from "../util/ApiError";

export const validateRequest = (schema) => (req, res, next) => {

    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        next();
    } catch (error) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        next(new APiError(400, errorMessage));
    }
}


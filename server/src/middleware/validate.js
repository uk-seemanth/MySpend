// Parses req[source] with a Zod schema. Clean result lands in req.valid[source].
// (Express 5 makes req.query read-only, so we never overwrite it.)
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.flatten().fieldErrors,
      });
    }
    req.valid = { ...req.valid, [source]: result.data };
    next();
  };

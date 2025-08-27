export function validateRequest(_schema) {
  return (req, res, next) => {
    // TODO: validate via zod/joi/yup
    next();
  };
}



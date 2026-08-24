export default function different(value, params, field, context = {}) {
  if (!Array.isArray(params) || params.length === 0 || !params[0]) return false;

  const otherField = params[0];
  // Tolerate callers passing the form data directly as the context object.
  const allData = context.allData || context;
  return value !== allData[otherField];
}

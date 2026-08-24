// Laravel's array rule optionally accepts a list of required keys
// (`array:field,other`). Client-side form payloads model arrays as JS arrays,
// so key checking is not applied here - a documented simplification.
export default function array(value) {
  return Array.isArray(value);
}

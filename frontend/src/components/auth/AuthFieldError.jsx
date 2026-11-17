export default function AuthFieldError({ id, message }) {
  return message ? <p id={id} role="alert" className="mt-1 text-xs text-red-700">{message}</p> : null;
}

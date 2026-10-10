/**
 * Polite live region for action announcements (watchlist save/remove).
 * `messageKey` forces re-announcement when the same action repeats.
 */
export default function LiveMessage({ text, messageKey }) {
  if (!text) return null
  return (
    <p key={messageKey} role="status" aria-live="polite" className="sr-only">
      {text}
    </p>
  )
}

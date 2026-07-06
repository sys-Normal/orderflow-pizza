// Hand-drawn, minimal geometric icons (own path data, not sourced from any
// icon library) so there are no licensing concerns.

export function PizzaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {/* Whole pizza, with a wedge cut out and pulled away as a slice */}
      <circle cx="9" cy="14" r="6" fill="currentColor" />
      <path d="M9 14L9 8L13.2 9.8Z" fill="var(--background)" />
      <circle cx="7" cy="16" r="1" fill="var(--background)" />
      <circle cx="11" cy="17" r="1" fill="var(--background)" />
      <path d="M14 9L14 3L18.2 4.8Z" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 2v6M8.5 2v6M11 2v6M6 8h5M8.5 8v13" />
      <path d="M16 2l1 0 .8 6-.8 2h-1l-.8-2z" />
      <path d="M17 10v11" />
    </svg>
  );
}

export function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 4h2l2.2 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6.2" />
      <circle cx="9.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

import { consultHref } from '../lib/whatsapp';

export function WhatsAppFloat() {
  return (
    <a
      href={consultHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#1fbe5c] text-white shadow-lg transition hover:-translate-y-0.5"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l5.9-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3A9.1 9.1 0 1 1 12 20.5z"
        />
      </svg>
    </a>
  );
}

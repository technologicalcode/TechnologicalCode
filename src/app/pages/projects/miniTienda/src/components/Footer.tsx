export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-[color:var(--color-paper)] pb-20 pt-10">
      <div className="mx-auto grid w-[min(100%-2rem,72rem)] gap-8 md:grid-cols-2">
        <div>
          <p className="text-2xl font-semibold">Miga</p>
          <p className="mt-2 text-[color:var(--color-muted)]">
            Av. La Mar 850, Miraflores
            <br />
            Mar–Sáb 9:00–19:00 · Dom 9:00–14:00
          </p>
          <div className="mt-4 flex gap-4 text-sm text-[color:var(--color-cocoa)]">
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
          </div>
        </div>
        <iframe
          title="Mapa de Miga"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="min-h-44 w-full border-0 grayscale"
          src="https://maps.google.com/maps?q=Av.%20La%20Mar%20850%20Miraflores%20Lima&z=15&output=embed"
        />
      </div>
      <p className="mx-auto mt-8 w-[min(100%-2rem,72rem)] text-xs text-[color:var(--color-muted)]">
        Desarrollado por{' '}
        <a href="/" className="text-[color:var(--color-cocoa)]">
          TechnologicalCode
        </a>
      </p>
    </footer>
  );
}

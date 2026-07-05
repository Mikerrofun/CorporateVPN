export function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          online ? "bg-good shadow-[0_0_10px_theme(colors.good)]" : "bg-slate-500"
        }`}
      />
      {online ? "Онлайн" : "Нет активности"}
    </span>
  );
}

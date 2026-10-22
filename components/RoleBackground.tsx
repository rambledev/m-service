// Decorative backdrop — soft blurred color blobs + a faint dot-grid, sitting fixed behind every
// page's content. Reads var(--brand-primary) directly, so it automatically re-themes to
// whichever role's accent is active via AppShell's `data-role` scoping (see app/globals.css) —
// no role prop needed here. All blobs deliberately use the saturated --brand-primary (not
// --brand-primary-soft, which is already close in lightness to the page background and barely
// shows any contrast against it at any reasonable opacity) so the color actually reads at a
// glance, while still staying low-opacity/blurred enough to never compete with foreground text.
//
// Deliberately NOT using a negative z-index to push this behind content: confirmed (via direct
// pixel-level testing) that `position: fixed` + a negative z-index fails to composite at all in
// at least one real browser engine build, even with otherwise-correct computed styles. Instead
// this relies on plain DOM order + z-index:auto — every content container below it in the tree
// (header, main, sidebar) is itself non-static (sticky/relative) or simply painted after it in
// source order, which is sufficient per normal stacking rules without touching z-index here.
export default function RoleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-primary)", opacity: 0.22 }}
      />
      <div
        className="absolute -right-24 -top-24 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-primary)", opacity: 0.16 }}
      />
      <div
        className="absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ backgroundColor: "var(--brand-primary)", opacity: 0.18 }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--text-muted) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
          opacity: 0.1,
        }}
      />
    </div>
  );
}

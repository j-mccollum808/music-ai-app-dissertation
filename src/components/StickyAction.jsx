export default function StickyAction({
  children,
  disabled,
  onClick,
  type = "button",
  form,
}) {
  return (
    <div
      className="fixed inset-x-0 z-50 px-4"
      style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
    >
      <button
        type={type}
        form={form}
        onClick={onClick}
        disabled={disabled}
        className="w-full px-4 py-3 rounded font-semibold text-black disabled:opacity-50"
        style={{ backgroundColor: "#00FF9F" }}
      >
        {children}
      </button>
    </div>
  );
}

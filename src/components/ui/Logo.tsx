export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-4xl",
  };

  return (
    <span className={`font-black tracking-tight ${sizes[size]}`}>
      Travel
      <span className="text-indigo-500 underline decoration-2 underline-offset-4">
        AI
      </span>
    </span>
  );
}

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: "text-xl",
    default: "text-2xl",
    large: "text-4xl",
  };

  return (
    <span className={`font-bold tracking-tight ${sizes[size]}`}>
      Travel
      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        AI
      </span>
    </span>
  );
}

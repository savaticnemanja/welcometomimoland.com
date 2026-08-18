import { MimoSymbol, MimolandWordmark } from "@/components/brand-marks";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={className ? `brand-lockup ${className}` : "brand-lockup"}>
      <MimoSymbol className="brand-symbol" />
      <MimolandWordmark className="brand-word" />
    </span>
  );
}

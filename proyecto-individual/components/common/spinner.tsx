import { Loader2, type LucideProps } from "lucide-react";

// Simple classNames utility function
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Spinner({ className, ...props }: LucideProps) {
  return (
    <Loader2 className={cn("animate-spin text-primary", className)} {...props} />
  );
}

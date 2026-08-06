import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "ghost";
  type?: "button" | "submit";
  className?: string;
}

export default function Button({
  children,
  onClick,
  disabled = false,
  isLoading = false,
  variant = "primary",
  type = "button",
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const base = "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150";

  const variants = {
    primary: isDisabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer",
    ghost: "text-gray-500 hover:text-gray-700 cursor-pointer px-0",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
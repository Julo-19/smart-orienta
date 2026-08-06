interface NoteInputProps {
  matiere: string;
  coefficient: number;
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function NoteInput({
  matiere,
  coefficient,
  value,
  onChange,
}: NoteInputProps) {

  // Invalide uniquement si > 20 ou < 0
  const isInvalid = value !== null && (value > 20 || value < 0);
  // Valide = entre 0 et 20 inclus
  const isValid   = value !== null && value >= 0 && value <= 20;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(parsed);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">

      {/* Nom + coefficient */}
      <div>
        <p className="text-sm font-medium text-gray-800">{matiere}</p>
        <p className="text-xs text-gray-400">Coef. {coefficient}</p>
      </div>

      {/* Input */}
      <div className="relative flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={20}
          step={0.5}
          value={value ?? ""}
          onChange={handleChange}
          placeholder="—"
          className={`
            w-20 h-10 text-center text-sm font-semibold rounded-lg border-2
            outline-none transition-all duration-150
            focus:ring-2 focus:ring-blue-100 focus:border-blue-400
            ${isInvalid
              ? "border-red-400 bg-red-50 text-red-600"
              : isValid
              ? "border-green-400 bg-green-50 text-green-700"
              : "border-gray-200 bg-white text-gray-700"
            }
          `}
        />

        {/* Icône checkmark uniquement si valide */}
        <div className="w-4">
          {isValid && (
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {isInvalid && (
            <svg
              className="w-4 h-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

      </div>
    </div>
  );
}
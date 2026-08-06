interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
}

const STEPS: Step[] = [
  { number: 1, label: "Académique"  },
  { number: 2, label: "Test RIASEC" },
  { number: 3, label: "Contexte"    },
  { number: 4, label: "Analyse ML"  },
  { number: 5, label: "Résultats"   },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full py-6">
      {STEPS.map((step, index) => (
        <div key={step.number} className="flex items-center">

          {/* Cercle + label */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-semibold text-sm transition-all duration-200
                ${currentStep === step.number
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : currentStep > step.number
                  ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
                  : "bg-white text-gray-400 border-2 border-gray-200"
                }
              `}
            >
              {currentStep > step.number ? (
                // Coche si étape passée
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-xs font-medium whitespace-nowrap ${
                currentStep === step.number
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Ligne entre les étapes */}
          {index < STEPS.length - 1 && (
            <div
              className={`
                w-16 h-0.5 mx-2 mb-4 transition-all duration-300
                ${currentStep > step.number ? "bg-blue-300" : "bg-gray-200"}
              `}
            />
          )}

        </div>
      ))}
    </div>
  );
}
import React from 'react';

interface StepTrailProps {
  currentStep: number;
  totalSteps?: number;
}

export const StepTrail: React.FC<StepTrailProps> = React.memo(({ currentStep, totalSteps = 4 }) => {
  if (currentStep <= 0) return null;

  return (
    <div className="trail flex gap-2 mb-4 px-1 items-center">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div
            key={idx}
            className={`trail-seg flex-1 h-2 rounded-full overflow-hidden transition-all duration-300 ${
              isDone || isActive
                ? 'bg-[#F2B90C] shadow-[0_0_8px_rgba(242,185,12,0.4)]'
                : 'bg-slate-200 dark:bg-white/10'
            }`}
          />
        );
      })}
    </div>
  );
});

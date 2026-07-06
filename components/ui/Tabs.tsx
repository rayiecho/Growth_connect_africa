"use client";

interface TabsProps {
  steps: string[];
  activeIndex: number;
  onStepClick?: (index: number) => void;
}

// Matches the live site's tabbed form pattern exactly: green labels,
// the active one bolder/darker, no boxed "wizard" styling.
export function Tabs({ steps, activeIndex, onStepClick }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-brand-line pb-4 mb-8">
      {steps.map((step, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <button
            key={step}
            type="button"
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick}
            className={`text-sm transition-colors ${
              isActive
                ? "font-semibold text-brand-green"
                : isDone
                ? "text-brand-green/70"
                : "text-brand-slate"
            }`}
          >
            {step}
          </button>
        );
      })}
    </div>
  );
}

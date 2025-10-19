import { cn } from '@/lib/utils';

interface MatchScoreIndicatorProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const MatchScoreIndicator = ({
  score,
  size = 'md',
  className,
  showLabel = true,
}: MatchScoreIndicatorProps) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.min(Math.max(score, 0), 100);

  // Calculate circle parameters
  const sizes = {
    sm: { radius: 16, stroke: 3, text: 'text-xs', container: 'w-10 h-10' },
    md: { radius: 20, stroke: 4, text: 'text-sm', container: 'w-12 h-12' },
    lg: { radius: 28, stroke: 5, text: 'text-base', container: 'w-16 h-16' },
  };

  const { radius, stroke, text, container } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'stroke-green-600 dark:stroke-green-400';
    if (score >= 60) return 'stroke-yellow-600 dark:stroke-yellow-400';
    if (score >= 40) return 'stroke-orange-600 dark:stroke-orange-400';
    return 'stroke-red-600 dark:stroke-red-400';
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('relative', container)}>
        <svg className="transform -rotate-90 w-full h-full" viewBox={`0 0 ${(radius + stroke) * 2} ${(radius + stroke) * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            className={cn('transition-all duration-700 ease-out', getStrokeColor(clampedScore))}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        {/* Percentage text in center */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-bold',
          text,
          getColor(clampedScore)
        )}>
          {Math.round(clampedScore)}
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">Match</span>
      )}
    </div>
  );
};

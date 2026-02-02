import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes cleanly
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnimatedBoxProps {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

const AnimatedBox: React.FC<AnimatedBoxProps> = ({ isVisible, children, className }) => {
  // We use shouldRender to control DOM presence
  const [shouldRender, setShouldRender] = React.useState(isVisible);
  // We use isAnimateTriggered to control the CSS transition state
  const [isAnimateTriggered, setIsAnimateTriggered] = React.useState(isVisible);

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure browser registers the "0fr" state before transitioning to "1fr"
      const raf = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsAnimateTriggered(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setIsAnimateTriggered(false);
    }
  }, [isVisible]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    // Only unmount when the height collapse transition finishes
    if (!isVisible && e.propertyName === 'grid-template-rows') {
      setShouldRender(false);
    }
  };

  if (!shouldRender) return null;

  const animationState = isAnimateTriggered ? 'open' : 'closed';

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      data-state={animationState}
      className={cn(
        "grid transition-all duration-500 ease-in-out",
        "data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]",
        className
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "duration-500 ease-in-out fill-mode-forwards",
            "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2"
          )}
          data-state={animationState}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AnimatedBox;

import React from "react";

interface LoadingProps {
  size?: number;
  /** Any CSS colour. Defaults to the theme's primary action colour. */
  color?: string;
  text?: string;
}

/**
 * Spinner (brief §4.7): action-primary arc that stops spinning under
 * prefers-reduced-motion. The label stays visible so the state is never
 * conveyed by motion alone.
 */
const Loading: React.FC<LoadingProps> = ({
  size = 40,
  color = "var(--ub-action-primary-bg)",
  text = "Loading...",
}) => {
  const stroke = size >= 40 ? 4 : 3;
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-10">
      <div
        aria-hidden="true"
        className="animate-spin rounded-ub-full motion-reduce:animate-none"
        style={{
          width: size,
          height: size,
          border: `${stroke}px solid ${color}`,
          borderTopColor: "transparent",
        }}
      />
      {text ? <p className="mt-3 text-ub-body-sm text-ub-text-secondary">{text}</p> : <span className="sr-only">Loading</span>}
    </div>
  );
};

export default Loading;

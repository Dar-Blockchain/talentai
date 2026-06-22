import React from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 16, className = "border-teal-200 border-t-teal-600" }) => (
  <span
    className={`inline-block rounded-full border-2 animate-spin ${className}`}
    style={{ width: size, height: size }}
  />
);

export default Spinner;

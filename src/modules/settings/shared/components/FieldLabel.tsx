import React from "react";

const FieldLabel = ({ text }: { text: string }) => (
  <p className="text-[0.72rem] font-semibold text-gray-500 uppercase tracking-wide mb-[6px]">
    {text}
  </p>
);

export default FieldLabel;

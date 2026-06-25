import React, { createContext, useContext, useState, useEffect } from "react";

interface CandidateLayoutCtx {
  breadcrumb:    string | undefined;
  setBreadcrumb: (v: string | undefined) => void;
}

const CandidateLayoutContext = createContext<CandidateLayoutCtx>({
  breadcrumb:    undefined,
  setBreadcrumb: () => {},
});

export const CandidateLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [breadcrumb, setBreadcrumb] = useState<string | undefined>(undefined);
  return (
    <CandidateLayoutContext.Provider value={{ breadcrumb, setBreadcrumb }}>
      {children}
    </CandidateLayoutContext.Provider>
  );
};

export const useCandidateLayoutContext = () => useContext(CandidateLayoutContext);

/** Call from a page component to set its breadcrumb in the persistent layout. */
export function useCandidateLayout(breadcrumb: string | undefined) {
  const { setBreadcrumb } = useCandidateLayoutContext();
  useEffect(() => {
    setBreadcrumb(breadcrumb);
  }, [breadcrumb, setBreadcrumb]);
}

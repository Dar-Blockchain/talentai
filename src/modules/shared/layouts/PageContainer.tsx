import React from "react";

type PageContainerProps = {
  children:        React.ReactNode;
  maxWidth?:       "xs" | "sm" | "md" | "lg" | "xl";
  disablePadding?: boolean;
};

const MAX_WIDTHS = {
  xs: "444px", sm: "600px", md: "900px", lg: "1200px", xl: "1536px",
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = "lg",
  disablePadding = false,
}) => (
  <div
    className="min-h-screen"
    style={{ backgroundColor: "rgba(251,254,255,1)", paddingBottom: disablePadding ? 0 : 16 }}
  >
    <div
      className="mx-auto w-full px-4"
      style={{ maxWidth: MAX_WIDTHS[maxWidth] }}
    >
      {children}
    </div>
  </div>
);

export default React.memo(PageContainer);

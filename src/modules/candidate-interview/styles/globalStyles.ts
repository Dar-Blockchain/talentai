export const GlobalStyles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%   { transform: scale(1);    opacity: 1; }
    50%  { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1);    opacity: 1; }
  }

  @keyframes fadeInUp {
    0%   { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0);    opacity: 1; }
  }

  @keyframes slideInFromTop {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(0); }
  }

  html { scroll-behavior: smooth; }

  .MuiButton-root:focus-visible {
    outline: 2px solid #00ff9d;
    outline-offset: 2px;
  }
`;

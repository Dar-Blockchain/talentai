import React from 'react';

export const SessionShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative flex-1 flex flex-col bg-gradient-to-br from-primary/5 via-background to-violet-50/60">
    <div
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ backgroundImage: 'radial-gradient(hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
    />
    <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full flex flex-col items-center gap-5">
        {children}
      </div>
    </div>
  </div>
);

import React from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[1.1rem] font-bold text-slate-900">
          Something went wrong
        </p>
        <p className="text-sm text-gray-500">
          An unexpected error occurred. Please reload the page.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-1 rounded-[10px]">
          Reload page
        </Button>
      </div>
    );
  }
}

export default ErrorBoundary;

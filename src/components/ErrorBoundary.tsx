import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error) {
            errorMessage = "Permission denied or database error. Please try again or contact support.";
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-6 text-center font-sans text-white">
          <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-8 md:p-12 max-w-lg w-full">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
            <p className="text-neutral-400 font-light mb-8 text-sm">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-full font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

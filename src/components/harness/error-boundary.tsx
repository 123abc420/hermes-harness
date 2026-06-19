'use client';

import { Component, type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class HarnessErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="border-red-500/10 bg-[#0f172a] max-w-md w-full">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                An unexpected error occurred while rendering the dashboard.
                This has been caught by the error boundary to prevent a full crash.
              </p>
              {this.state.error && (
                <p className="mt-3 max-w-sm rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 font-mono text-[10px] text-zinc-600 break-all">
                  {this.state.error.message}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="mt-5 gap-1.5 border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
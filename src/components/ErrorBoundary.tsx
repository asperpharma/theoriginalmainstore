import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASPER_PROTOCOL } from "@/lib/asperProtocol";
import { supabase } from "@/integrations/supabase/client";

export function logClientError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  supabase.from("telemetry_events").insert({
    event: "client_error",
    source: context ?? "unknown",
    payload: { message, stack, url: window.location.href },
  }).catch(err => console.error("Failed to log telemetry:", err));
}

interface Props {
  children: ReactNode;
  /** When this value changes, an active error state is cleared automatically (e.g. on route change). */
  resetKey?: string | number;
  /** Optional custom fallback. Receives the error and a reset callback that clears the boundary. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Optional context label included in telemetry to identify which boundary tripped. */
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    const stackHint = errorInfo.componentStack?.split("\n")[1]?.trim() ?? "unknown";
    const label = this.props.context ? `${this.props.context}:${stackHint}` : `ErrorBoundary:${stackHint}`;
    logClientError(error, label);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div role="alert" className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Brief technical interruption
            </h1>
            <p className="text-muted-foreground mb-6">
              {ASPER_PROTOCOL.errorFull.en}
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={this.reset}
                className="w-full gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Application
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <a href="/contact">Contact Concierge</a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


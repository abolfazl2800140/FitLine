import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">مشکلی پیش آمد</h2>
                        <p className="text-muted-foreground mb-4">
                            متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.
                        </p>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <pre className="text-xs text-left bg-muted p-3 rounded-lg mb-4 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-2 justify-center">
                            <Button onClick={this.handleReset} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                تلاش مجدد
                            </Button>
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                بارگذاری مجدد صفحه
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Hook-based error boundary wrapper for functional components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

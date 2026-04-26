import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * LoadingSpinner - Generic loading component
 */
export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
    <p className="text-gray-600">{message}</p>
  </div>
);

/**
 * ErrorAlert - Generic error display component
 */
export const ErrorAlert = ({ error, onRetry, onDismiss }) => {
  const errorMessage =
    error?.data?.detail ||
    error?.message ||
    error ||
    "An unexpected error occurred";

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{errorMessage}</p>
        <div className="flex gap-2">
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-red-700 hover:bg-red-50"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * EmptyState - Display when no data is available
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    {Icon && (
      <Icon className="h-12 w-12 text-gray-400 mb-4" />
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-center mb-4">{description}</p>
    {action && action}
  </div>
);

/**
 * PageLoader - Full page loading state
 */
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

/**
 * QueryErrorBoundary - Error boundary for query errors
 */
export class QueryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Query error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorAlert
          error={this.state.error}
          onDismiss={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default {
  LoadingSpinner,
  ErrorAlert,
  EmptyState,
  PageLoader,
  QueryErrorBoundary,
};

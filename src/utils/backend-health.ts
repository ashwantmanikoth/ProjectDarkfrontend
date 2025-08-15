/**
 * Backend Health Check and Error Handling Utilities
 */

export interface BackendHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    timestamp: string;
    services: {
        flask: string;
        qdrant: string;
        database: string;
    };
    qdrant_stats?: {
        collections: number;
        total_points: number;
    };
}

export interface BackendError {
    type: 'connection' | 'processing' | 'validation' | 'unknown';
    message: string;
    details?: any;
    timestamp: string;
}

class BackendHealthChecker {
    private healthEndpoint: string;
    private isHealthy: boolean = false;
    private lastCheck: number = 0;
    private checkInterval: number = 30000; // 30 seconds
    private healthCache: BackendHealth | null = null;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') {
        this.healthEndpoint = `${baseUrl}/health`;
    }

    /**
     * Check if backend is healthy
     */
    async checkHealth(): Promise<BackendHealth> {
        try {
            const response = await fetch(this.healthEndpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const health: BackendHealth = await response.json();
            this.isHealthy = health.status === 'healthy';
            this.lastCheck = Date.now();
            this.healthCache = health;

            return health;
        } catch (error) {
            const health: BackendHealth = {
                status: 'unhealthy',
                message: 'Backend health check failed',
                timestamp: new Date().toISOString(),
                services: {
                    flask: 'unknown',
                    qdrant: 'unknown',
                    database: 'unknown',
                },
            };

            this.isHealthy = false;
            this.healthCache = health;

            throw new Error(`Backend health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get cached health status (if available and recent)
     */
    getCachedHealth(): BackendHealth | null {
        if (!this.healthCache || Date.now() - this.lastCheck > this.checkInterval) {
            return null;
        }
        return this.healthCache;
    }

    /**
     * Check if backend is currently healthy
     */
    isBackendHealthy(): boolean {
        return this.isHealthy;
    }

    /**
     * Get user-friendly error message for backend issues
     */
    getErrorMessage(error: any): string {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return 'Cannot connect to backend server. Please check if the backend is running and try again later.';
        }

        if (error.message?.includes('Backend health check failed')) {
            return 'Backend services are currently unavailable. Please try again later.';
        }

        if (error.message?.includes('timeout')) {
            return 'Request timed out. The backend may be overloaded. Please try again later.';
        }

        return error.message || 'An unexpected error occurred. Please try again later.';
    }

    /**
     * Check if an error is a backend connection issue
     */
    isConnectionError(error: any): boolean {
        return (
            error instanceof TypeError ||
            error.message?.includes('fetch') ||
            error.message?.includes('Backend health check failed') ||
            error.message?.includes('timeout')
        );
    }

    /**
     * Get recommended action for backend errors
     */
    getRecommendedAction(error: any): string {
        if (this.isConnectionError(error)) {
            return 'Please ensure the backend server is running and accessible.';
        }

        if (error.message?.includes('processing')) {
            return 'The document is being processed. Please wait and try again.';
        }

        if (error.message?.includes('validation')) {
            return 'Please check your input and try again.';
        }

        return 'Please try again later or contact support if the issue persists.';
    }
}

// Global instance
export const backendHealthChecker = new BackendHealthChecker();

/**
 * Wrapper for API calls with health check and error handling
 */
export async function apiCallWithHealthCheck<T>(
    apiCall: () => Promise<T>,
    options: {
        showError?: boolean;
        fallbackMessage?: string;
    } = {}
): Promise<T> {
    try {
        // Check backend health first
        await backendHealthChecker.checkHealth();

        // Make the API call
        return await apiCall();
    } catch (error) {
        const errorMessage = backendHealthChecker.getErrorMessage(error);
        const recommendedAction = backendHealthChecker.getRecommendedAction(error);

        console.error('API call failed:', error);
        console.error('Error message:', errorMessage);
        console.error('Recommended action:', recommendedAction);

        // If it's a connection error, show a user-friendly message
        if (backendHealthChecker.isConnectionError(error)) {
            const connectionError: BackendError = {
                type: 'connection',
                message: 'Backend connection failed',
                details: {
                    error: errorMessage,
                    recommendation: recommendedAction,
                },
                timestamp: new Date().toISOString(),
            };

            throw connectionError;
        }

        // Re-throw the original error
        throw error;
    }
}

/**
 * Check if backend is accessible before making requests
 */
export async function ensureBackendHealth(): Promise<boolean> {
    try {
        await backendHealthChecker.checkHealth();
        return true;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}

/**
 * Get user-friendly status message for backend health
 */
export function getBackendStatusMessage(health: BackendHealth): string {
    switch (health.status) {
        case 'healthy':
            return 'All backend services are running normally';
        case 'degraded':
            return 'Some backend services are experiencing issues';
        case 'unhealthy':
            return 'Backend services are currently unavailable';
        default:
            return 'Backend status is unknown';
    }
}

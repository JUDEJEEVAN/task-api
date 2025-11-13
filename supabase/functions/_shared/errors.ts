/**
 * Custom API Error Class
 *
 * Standardized error format for our entire API.
 * Every endpoint returns errors in the same shape.
 */

import { corsHeaders } from "./cors.ts";

export class APIError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string,
    ) {
        super(message);
        this.name = "APIError";
    }

    /**
     * convert to JSRON response
     */
    toResponse(): Response {
        return new Response(
            JSON.stringify({
                error: {
                    message: this.message,
                    code: this.code,
                    statusCode: this.statusCode,
                },
            }),
            {
                status: this.statusCode,
                headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders,
                },
            },
        );
    }
}

export const errors = {
    unauthorized: () => new APIError(401, "Unauthorized", "UNAUTHORIZED"),
    forbidden: () => new APIError(403, "Forbidden", "FORBIDDEN"),
    notFound: (resource: string) =>
        new APIError(404, `${resource} not found`, "NOT_FOUND"),
    badRequest: (message: string) => new APIError(400, message, "BAD_REQUEST"),
    internal: () => new APIError(500, "Inernal server error", "INTERNAL_ERROR"),
};

/**
 * Supabase Client Factory
 *
 * creates authenticated supabase client from request headers.
 * Extracts JWT token and creates client with user context.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { APIError } from "./errors.ts";

/**
 * Create supabase client from request
 *
 * reads JWT token from Authorization header and creates a client
 * with that user's ermissions.
 */
export function createSupabaseClient(req: Request) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // extract JWT token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
        throw new APIError(
            401,
            "Missing Authorization header",
            "NO_AUTH_HEADER",
        );
    }

    // create client with user's token
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    });
}

/**
 * Get current user from JWT token
 *
 * validates token and returns user object.
 * throws error if token is invalid
 */
export async function getCurrentUser(req: Request) {
    const supabase = createSupabaseClient(req);

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        throw new APIError(401, "Invalid or expired token", "INVALID_TOKEN");
    }

    return user;
}

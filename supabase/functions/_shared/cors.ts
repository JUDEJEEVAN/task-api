// cors headers
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
};

/**
 * Handle CORS preflight requests
 *
 * browsers send an OPTIONS request before the actual request.
 * we just return 200 OK with CORS heaers
 */
export function handleCors(req: Request): Response | null {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    return null;
}

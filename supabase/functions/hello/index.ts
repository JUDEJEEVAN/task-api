import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("hello function started");

serve(async (req) => {
  console.log(`${req.method} ${req.url}`);

  return new Response(
    JSON.stringify({
      message: "Hello from supabase functions",
      timeStamp: new Date().toISOString(),
      method: req.method,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    },
  );
});

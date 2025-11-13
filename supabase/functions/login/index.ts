import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { APIError, errors } from "../_shared/errors.ts";

console.log("Login function started");

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    if (req.method !== "POST") {
      throw errors.badRequest("Method not allowed");
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      throw errors.badRequest("Missing required fields: email, password");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new APIError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    if (!data.user || !data.session) {
      throw errors.internal();
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq(
      "id",
      data.user.id,
    ).single();

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
        },
        session: data.session,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    if (error instanceof APIError) {
      return error.toResponse();
    }

    console.error("Unexpected error: ", error);
    return errors.internal().toResponse();
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { APIError, errors } from "../_shared/errors.ts";

console.log("Register function started");

serve(async (req: Request) => {
  // handle cors preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // only allow post
    if (req.method !== "POST") {
      throw errors.badRequest("Method not allowed");
    }

    // parse request body
    const { email, password, full_name } = await req.json();

    if (!email || !password || !full_name) {
      throw errors.badRequest(
        "Missing required fields: email, password, full_name",
      );
    }

    if (password.length < 6) {
      throw errors.badRequest("Password must be at least 6 characters");
    }

    // create supabase client (not authenticated, using service role would be wrong here)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    // register user with supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new APIError(400, authError.message, "AUTH_ERROR");
    }

    if (!authData.user) {
      throw errors.internal();
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      full_name,
      avatar_url: null,
      bio: null,
    });

    if (profileError) {
      // if profile creation fails, user is still created in auth.users
      // in production we would handle this more carefully
      console.error("Profile creation error:", profileError);
      throw new APIError(500, "Failed to create profile", "PROFILE_ERROR");
    }

    return new Response(
      JSON.stringify({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
        },
        session: authData.session,
      }),
      {
        status: 201,
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

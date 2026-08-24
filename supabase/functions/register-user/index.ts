import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: ["publishable"] },

    async (req, ctx) => {
      try {
        const {
          name,
          email,
          password,
          organizerPassword,
        } = await req.json();

        // Basic validation
        if (!name?.trim()) {
          return Response.json(
            {
              error: "Please enter your name.",
            },
            {
              status: 400,
            },
          );
        }

        if (!email?.trim()) {
          return Response.json(
            {
              error: "Please enter your email.",
            },
            {
              status: 400,
            },
          );
        }

        if (!password) {
          return Response.json(
            {
              error: "Please enter your password.",
            },
            {
              status: 400,
            },
          );
        }

        if (!organizerPassword) {
          return Response.json(
            {
              error: "Please create an organizer password.",
            },
            {
              status: 400,
            },
          );
        }

        if (organizerPassword.length < 6) {
          return Response.json(
            {
              error:
                "Organizer password must be at least 6 characters.",
            },
            {
              status: 400,
            },
          );
        }

        // 1. Create normal Supabase Auth account.
        // This keeps your normal email-verification flow.
        const { data: signUpData, error: signUpError } =
          await ctx.supabase.auth.signUp({
            email: email.trim(),
            password,

            options: {
              data: {
                name: name.trim(),
              },
            },
          });

        if (signUpError) {
          return Response.json(
            {
              error: signUpError.message,
            },
            {
              status: 400,
            },
          );
        }

        const userId = signUpData.user?.id;

        if (!userId) {
          return Response.json(
            {
              error: "Unable to create user.",
            },
            {
              status: 500,
            },
          );
        }

        // 2. Securely hash and store Organizer Password.
        // Only the service-role client can call this RPC.
        const {
          data: organizerSaved,
          error: organizerError,
        } = await ctx.supabaseAdmin.rpc(
          "set_organizer_password_for_user",
          {
            target_user_id: userId,
            new_password: organizerPassword,
          },
        );

        if (organizerError || !organizerSaved) {
          console.error(
            "Organizer password save error:",
            organizerError,
          );

          // Avoid leaving an account without its organizer credential.
          await ctx.supabaseAdmin.auth.admin.deleteUser(
            userId,
          );

          return Response.json(
            {
              error:
                "Unable to create organizer credentials. Please try again.",
            },
            {
              status: 500,
            },
          );
        }

        return Response.json(
          {
            success: true,
            message:
              "Registration successful. Please verify your email before logging in.",
          },
          {
            status: 200,
          },
        );
      } catch (error) {
        console.error(
          "register-user error:",
          error,
        );

        return Response.json(
          {
            error:
              "Something went wrong while creating your account.",
          },
          {
            status: 500,
          },
        );
      }
    },
  ),
};
import { supabase } from "./supabase.js";

const output = document.getElementById("output");

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;

  output.textContent = "Signing in...";

  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      throw new Error(`Login failed: ${authError.message}`);
    }

    const user = authData.user;

    output.textContent = "Login successful. Testing profile...";

    // Create/update your profile.
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: "Test User",
          degree: "BE ICT",
          start_year: new Date().getFullYear(),
          target_direction: "AI Systems / AI Engineering + Systems",
          current_year: 1,
        })
        .select()
        .single();

    if (profileError) {
      throw new Error(`Profile failed: ${profileError.message}`);
    }

    output.textContent = "Profile OK. Testing task progress...";

    // Create/update a test task-progress record.
    const { data: progress, error: progressError } =
      await supabase
        .from("task_progress")
        .upsert({
          user_id: user.id,
          task_id: "connection-test",
          status: "done",
          notes: "Supabase authenticated CRUD test",
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (progressError) {
      throw new Error(`Task progress failed: ${progressError.message}`);
    }

    // Read it back through RLS.
    const { data: readBack, error: readError } =
      await supabase
        .from("task_progress")
        .select("*")
        .eq("task_id", "connection-test")
        .single();

    if (readError) {
      throw new Error(`Read failed: ${readError.message}`);
    }

    output.textContent = JSON.stringify(
      {
        success: true,
        message: "Supabase Auth + RLS + CRUD test passed.",
        user: {
          id: user.id,
          email: user.email,
        },
        profile,
        task_progress: readBack,
      },
      null,
      2
    );

  } catch (error) {
    output.textContent = JSON.stringify(
      {
        success: false,
        error: error.message || String(error),
      },
      null,
      2
    );

    console.error(error);
  }
});
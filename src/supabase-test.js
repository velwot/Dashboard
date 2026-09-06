import { supabase } from "./supabase.js";


async function testConnection() {
  const output = document.getElementById("output");

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("id")
      .limit(1);

    output.textContent = JSON.stringify(
      {
        success: !error,
        data,
        error: error
          ? {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          : null,
      },
      null,
      2
    );
  } catch (err) {
    output.textContent = JSON.stringify(
      {
        success: false,
        error: String(err),
      },
      null,
      2
    );
  }
}

testConnection();
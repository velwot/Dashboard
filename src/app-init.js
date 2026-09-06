import {
  getCurrentUser,
  signIn,
  signUp,
  signOut,
  watchAuth,
} from "./auth.js";

import {
  loadCompleteCloudState,
} from "./cloud-sync.js";


const app = document.querySelector(".app");

let gate;
let mode = "signin";

let dashboardStarted = false;


/* ============================================================
   LOGIN UI
   ============================================================ */

function createGate() {
  // Avoid creating the gate multiple times
  if (gate && document.body.contains(gate)) {
    renderGate();
    return;
  }

  gate = document.createElement("div");

  gate.style.cssText = `
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:#f6f7fb;
    padding:20px;
  `;

  document.body.prepend(gate);

  renderGate();
}


function renderGate(message = "") {
  gate.innerHTML = `
    <div style="
      width:min(420px,100%);
      background:#fff;
      border:1px solid #e5e7eb;
      border-radius:14px;
      padding:24px;
      box-shadow:0 8px 30px rgba(0,0,0,.08);
    ">

      <div style="
        font-size:22px;
        font-weight:800;
        margin-bottom:4px
      ">
        ICT → AI Era
      </div>

      <div style="
        font-size:13px;
        color:#667085;
        margin-bottom:20px
      ">
        Personal Career OS
      </div>

      <div style="
        display:flex;
        gap:8px;
        margin-bottom:16px
      ">

        <button
          id="signin-tab"
          style="
            flex:1;
            padding:9px;
            border-radius:8px;
            border:1px solid #e5e7eb;
            background:${mode === "signin" ? "#eef2ff" : "#fff"};
          "
        >
          Sign in
        </button>

        <button
          id="signup-tab"
          style="
            flex:1;
            padding:9px;
            border-radius:8px;
            border:1px solid #e5e7eb;
            background:${mode === "signup" ? "#eef2ff" : "#fff"};
          "
        >
          Create account
        </button>

      </div>

      <form id="auth-form">

        ${
          mode === "signup"
            ? `
              <label style="
                display:block;
                font-size:12px;
                font-weight:700;
                margin-bottom:5px
              ">
                Name
              </label>

              <input
                id="auth-name"
                required
                placeholder="Your name"
                style="
                  width:100%;
                  padding:10px;
                  border:1px solid #d0d5dd;
                  border-radius:8px;
                  margin-bottom:12px
                "
              >
            `
            : ""
        }

        <label style="
          display:block;
          font-size:12px;
          font-weight:700;
          margin-bottom:5px
        ">
          Email
        </label>

        <input
          id="auth-email"
          type="email"
          required
          autocomplete="email"
          placeholder="you@example.com"
          style="
            width:100%;
            padding:10px;
            border:1px solid #d0d5dd;
            border-radius:8px;
            margin-bottom:12px
          "
        >

        <label style="
          display:block;
          font-size:12px;
          font-weight:700;
          margin-bottom:5px
        ">
          Password
        </label>

        <input
          id="auth-password"
          type="password"
          required
          minlength="6"
          autocomplete="${mode === "signin"
            ? "current-password"
            : "new-password"}"
          placeholder="••••••••"
          style="
            width:100%;
            padding:10px;
            border:1px solid #d0d5dd;
            border-radius:8px;
            margin-bottom:14px
          "
        >

        <button
          type="submit"
          style="
            width:100%;
            padding:10px;
            border:0;
            border-radius:8px;
            background:#4f46e5;
            color:#fff;
            font-weight:700;
          "
        >
          ${mode === "signin"
            ? "Sign in"
            : "Create account"}
        </button>

      </form>

      <div
        id="auth-message"
        style="
          min-height:20px;
          margin-top:12px;
          font-size:13px;
          color:#667085;
        "
      >
        ${message}
      </div>

    </div>
  `;


  document
    .getElementById("signin-tab")
    .addEventListener("click", () => {
      mode = "signin";
      renderGate();
    });


  document
    .getElementById("signup-tab")
    .addEventListener("click", () => {
      mode = "signup";
      renderGate();
    });


  document
    .getElementById("auth-form")
    .addEventListener("submit", handleSubmit);
}


/* ============================================================
   LOGIN / SIGNUP
   ============================================================ */

async function handleSubmit(event) {
  event.preventDefault();

  const email =
    document.getElementById("auth-email").value.trim();

  const password =
    document.getElementById("auth-password").value;

  const message =
    document.getElementById("auth-message");

  message.textContent =
    mode === "signin"
      ? "Signing in..."
      : "Creating account...";


  try {

    if (mode === "signin") {

      await signIn(email, password);

    } else {

      const name =
        document.getElementById("auth-name").value.trim();

      await signUp(email, password, {
        name,
        degree: "BE ICT",
        startYear: new Date().getFullYear(),
        target:
          "AI Systems / AI Engineering + Systems",
      });
    }

    await startDashboard();

  } catch (error) {

    console.error(error);

    message.textContent =
      error.message || String(error);
  }
}


/* ============================================================
   START DASHBOARD
   ============================================================ */

async function startDashboard() {

  if (dashboardStarted) {
    return;
  }

  dashboardStarted = true;

  try {

    const user = await getCurrentUser();

    if (!user) {
      dashboardStarted = false;
      return;
    }

    window.__careerUser = user;

    window.__signOut = async function () {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out failed:", error);
        alert(`Sign out failed: ${error.message}`);
      }
    };

    const accountEmail =
      document.getElementById("accountEmail");

    if (accountEmail) {
      accountEmail.textContent = user.email || "";
    }


    /*
      IMPORTANT:
      Load Supabase BEFORE rendering the dashboard.
    */

    const cloudState =
      await loadCompleteCloudState();


    /*
      index.html owns P because it is a classic script.
      We expose a controlled bridge for cloud hydration.
    */

    if (
      typeof window.__applyCloudState === "function"
    ) {
      window.__applyCloudState(cloudState);
    }


    gate?.remove();

    app.hidden = false;


    if (
      typeof window.__bootDashboard === "function"
    ) {
      await window.__bootDashboard();
    }

  } catch (error) {

    console.error(
      "Could not load Career OS cloud state:",
      error
    );

    dashboardStarted = false;

    const message =
      document.getElementById("auth-message");

    if (message) {
      message.textContent =
        `Could not load cloud data: ${error.message}`;
    }
  }
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

async function start() {

  // Keep the dashboard hidden until authentication is confirmed
  try {
    app.hidden = true;

    createGate();

    const user = await getCurrentUser();

    if (user) {
      await startDashboard();
    }

    watchAuth(async (_event, session) => {
      // If a user signs in, initialize once
      if (session?.user) {
        if (!dashboardStarted) {
          await startDashboard();
        }
        return;
      }

      // Signed out or no session: hide app and show gate
      try {
        dashboardStarted = false;
        app.hidden = true;
        createGate();
      } catch (err) {
        console.error("Error handling sign-out state:", err);
      }
    });

  } catch (error) {
    console.error("Auth initialization failed:", error);
    // Show a clear message in the gate if available
    try {
      createGate();
      const message = document.getElementById("auth-message");
      if (message) {
        message.textContent = `Authentication initialization failed: ${error.message}`;
      }
    } catch (err) {
      console.error("Failed to display auth error:", err);
    }
  }
}


start();
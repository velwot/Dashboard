import { supabase } from "./supabase.js";

import {
  getProfile,
  saveProfile,

  getTaskProgress,
  saveTaskProgress,

  getTasks,
  saveTask,
  deleteTaskByExternalId,

  getProjects,
  saveProject,
  deleteProject,

  getPeople,
  savePerson,
  deletePerson,

  getOpportunities,
  saveOpportunity,
  deleteOpportunity,

  getEvidence,
  saveEvidence,
  deleteEvidence,

  getReviews,
  saveReview,
  deleteReview,

  getNotes,
  saveNote,
  deleteNote,

  getSettings,
  saveSettings,
} from "./db.js";


/* ============================================================
   CLOUD STATE
   ============================================================ */

export async function loadCompleteCloudState() {
  const [
    profile,
    taskState,
    tasks,
    projects,
    people,
    opportunities,
    evidence,
    reviews,
    notes,
    settings,
  ] = await Promise.all([
    getProfile(),
    getTaskProgress(),
    getTasks(),
    getProjects(),
    getPeople(),
    getOpportunities(),
    getEvidence(),
    getReviews(),
    getNotes(),
    getSettings(),
  ]);

  return {
    profile,
    taskState,
    tasks,
    projects,
    people,
    opportunities,
    evidence,
    reviews,
    notes,
    settings,
  };
}


/* ============================================================
   TASK PROGRESS DELETE
   ============================================================ */

async function deleteTaskProgress(taskId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not authenticated.");

  const { error } = await supabase
    .from("task_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("task_id", String(taskId));

  if (error) throw error;
}


/* ============================================================
   GENERIC COLLECTION RECONCILIATION
   ============================================================ */

async function syncCollection({
  local,
  remote,
  save,
  remove,
}) {
  const localMap = new Map(
    (local || [])
      .filter(item => item?.id)
      .map(item => [String(item.id), item])
  );

  for (const item of localMap.values()) {
    await save(item);
  }

  for (const item of remote || []) {
    if (!item?.id) continue;

    const id = String(item.id);

    if (!localMap.has(id)) {
      await remove(id);
    }
  }
}


/* ============================================================
   FULL PRIVATE STATE SYNC
   ============================================================ */

export async function syncPrivateState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Invalid private state.");
  }

  /* Profile */

  await saveProfile(state.profile || {});


  /* Public roadmap task progress */

  const localProgress = state.taskState || {};

  const remoteProgress = await getTaskProgress();

  for (const [taskId, progress] of Object.entries(localProgress)) {
    await saveTaskProgress(
      taskId,
      progress?.status || "todo",
      progress?.notes || ""
    );
  }

  for (const taskId of Object.keys(remoteProgress)) {
    if (!(taskId in localProgress)) {
      await deleteTaskProgress(taskId);
    }
  }


  /* Custom tasks */

  const remoteTasks = await getTasks();

  await syncCollection({
    local: state.tasks || [],
    remote: remoteTasks,
    save: saveTask,
    remove: deleteTaskByExternalId,
  });


  /* Projects */

  const remoteProjects = await getProjects();

  await syncCollection({
    local: state.projects || [],
    remote: remoteProjects,
    save: saveProject,
    remove: deleteProject,
  });


  /* People */

  const remotePeople = await getPeople();

  await syncCollection({
    local: state.people || [],
    remote: remotePeople,
    save: savePerson,
    remove: deletePerson,
  });


  /* Opportunities */

  const remoteOpportunities = await getOpportunities();

  await syncCollection({
    local: state.opportunities || [],
    remote: remoteOpportunities,
    save: saveOpportunity,
    remove: deleteOpportunity,
  });


  /* Evidence */

  const remoteEvidence = await getEvidence();

  await syncCollection({
    local: state.evidence || [],
    remote: remoteEvidence,
    save: saveEvidence,
    remove: deleteEvidence,
  });


  /* Reviews */

  const remoteReviews = await getReviews();

  await syncCollection({
    local: state.reviews || [],
    remote: remoteReviews,
    save: saveReview,
    remove: deleteReview,
  });


  /* Notes */

  const remoteNotes = await getNotes();

  await syncCollection({
    local: state.notes || [],
    remote: remoteNotes,
    save: saveNote,
    remove: deleteNote,
  });


  /* Settings */

  await saveSettings(
    state.settings || { focusYear: 1 }
  );
}


/* ============================================================
   DEBOUNCED AUTO-SYNC
   ============================================================ */

let syncTimer = null;
let pendingState = null;
let syncRunning = false;

export function scheduleCloudSync(state) {
  pendingState = structuredClone(state);

  clearTimeout(syncTimer);

  syncTimer = setTimeout(() => {
    flushCloudSync();
  }, 600);
}


async function flushCloudSync() {
  if (syncRunning || !pendingState) {
    return;
  }

  syncRunning = true;

  const state = pendingState;
  pendingState = null;

  try {
    await syncPrivateState(state);

    window.__cloudSyncStatus = "synced";
    window.__cloudSyncError = null;

    const cloudStatus =
      document.getElementById("cloudStatus");

    if (cloudStatus) {
      cloudStatus.textContent = "Cloud: synced";
      cloudStatus.className = "badge good";
    }

    if (typeof window.toast === "function") {
      window.toast("Saved to cloud");
    }

  } catch (error) {
    console.error("Cloud sync failed:", error);

    window.__cloudSyncStatus = "error";
    window.__cloudSyncError = error;

      const cloudStatus =
        document.getElementById("cloudStatus");

      if (cloudStatus) {
        cloudStatus.textContent = "Cloud: error";
        cloudStatus.className = "badge danger";
      }

    if (typeof window.toast === "function") {
      window.toast("Cloud sync failed — local backup kept");
    }

  } finally {
    syncRunning = false;

    if (pendingState) {
      scheduleCloudSync(pendingState);
    }
  }
}


/* ============================================================
   CANCEL PENDING SYNC
   ============================================================ */

export function cancelCloudSync() {
  clearTimeout(syncTimer);
  syncTimer = null;
  pendingState = null;
}


/* ============================================================
   RESET ALL CLOUD PRIVATE DATA
   Keeps the Auth account itself.
   ============================================================ */

export async function resetCloudState() {
  cancelCloudSync();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User is not authenticated.");


  const userTables = [
    "task_progress",
    "tasks",
    "projects",
    "people",
    "opportunities",
    "evidence",
    "reviews",
    "notes",
    "user_settings",
  ];


  for (const table of userTables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }
  }


  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    throw profileError;
  }
}

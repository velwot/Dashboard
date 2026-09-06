import {
  saveProfile,
  saveTaskProgress,
  saveTask,
  saveProject,
  savePerson,
  saveOpportunity,
  saveEvidence,
  saveReview,
  saveNote,
  saveSettings,
} from "./db.js";

const PRIVATE_KEY = "ictAiCareerDashboard.private.v4";

const DEFAULT_PRIVATE = {
  schemaVersion: 1,
  type: "private-backup",
  profile: {
    name: "",
    degree: "BE ICT",
    startYear: new Date().getFullYear(),
    target: "AI Systems / AI Engineering + Systems",
  },
  taskState: {},
  tasks: [],
  projects: [],
  people: [],
  opportunities: [],
  evidence: [],
  reviews: [],
  notes: [],
  settings: {
    focusYear: 1,
    lastReview: "",
    notifications: false,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function readLocalState() {
  try {
    const raw = localStorage.getItem(PRIVATE_KEY);

    if (!raw) {
      return clone(DEFAULT_PRIVATE);
    }

    const parsed = JSON.parse(raw);

    return {
      ...clone(DEFAULT_PRIVATE),
      ...parsed,
      profile: {
        ...clone(DEFAULT_PRIVATE.profile),
        ...(parsed.profile || {}),
      },
      settings: {
        ...clone(DEFAULT_PRIVATE.settings),
        ...(parsed.settings || {}),
      },
    };
  } catch (error) {
    throw new Error(
      `Could not read local Career OS data: ${error.message}`
    );
  }
}

export function validateLocalState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Private data is not an object.");
  }

  if (state.schemaVersion !== 1) {
    throw new Error(
      `Unsupported schemaVersion: ${state.schemaVersion}`
    );
  }

  if (state.type !== "private-backup") {
    throw new Error(
      `Expected type "private-backup", got "${state.type}".`
    );
  }

  const arrays = [
    "tasks",
    "projects",
    "people",
    "opportunities",
    "evidence",
    "reviews",
    "notes",
  ];

  for (const key of arrays) {
    if (!Array.isArray(state[key])) {
      throw new Error(`${key} must be an array.`);
    }
  }

  if (!state.taskState || typeof state.taskState !== "object") {
    throw new Error("taskState must be an object.");
  }

  return true;
}

export function makeBackup() {
  const state = readLocalState();

  const blob = new Blob(
    [JSON.stringify(state, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download =
    `ict-career-pre-cloud-migration-${Date.now()}.json`;

  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return state;
}

export function migrationPreview(state) {
  validateLocalState(state);

  return {
    profile: state.profile?.name
      ? `Profile: ${state.profile.name}`
      : "Profile: no name set",

    customTasks: state.tasks.length,

    taskProgress: Object.keys(state.taskState).length,

    projects: state.projects.length,

    people: state.people.length,

    opportunities: state.opportunities.length,

    evidence: state.evidence.length,

    reviews: state.reviews.length,

    notes: state.notes.length,

    focusYear: state.settings.focusYear,
  };
}

export async function migrateLocalState(state) {
  validateLocalState(state);

  const results = {
    profile: false,
    taskProgress: 0,
    tasks: 0,
    projects: 0,
    people: 0,
    opportunities: 0,
    evidence: 0,
    reviews: 0,
    notes: 0,
    settings: false,
  };

  /* ---------------- PROFILE ---------------- */

  await saveProfile(state.profile);
  results.profile = true;

  /* ---------------- PUBLIC TASK PROGRESS ---------------- */

  for (const [taskId, progress] of Object.entries(
    state.taskState
  )) {
    await saveTaskProgress(
      taskId,
      progress.status || "todo",
      progress.notes || ""
    );

    results.taskProgress++;
  }

  /* ---------------- CUSTOM TASKS ---------------- */

  for (const task of state.tasks) {
    await saveTask(task);
    results.tasks++;
  }

  /* ---------------- PROJECTS ---------------- */

  for (const project of state.projects) {
    await saveProject(project);
    results.projects++;
  }

  /* ---------------- PEOPLE ---------------- */

  for (const person of state.people) {
    await savePerson(person);
    results.people++;
  }

  /* ---------------- OPPORTUNITIES ---------------- */

  for (const opportunity of state.opportunities) {
    await saveOpportunity(opportunity);
    results.opportunities++;
  }

  /* ---------------- EVIDENCE ---------------- */

  for (const evidence of state.evidence) {
    await saveEvidence(evidence);
    results.evidence++;
  }

  /* ---------------- REVIEWS ---------------- */

  for (const review of state.reviews) {
    await saveReview(review);
    results.reviews++;
  }

  /* ---------------- NOTES ---------------- */

  for (const note of state.notes) {
    await saveNote(note);
    results.notes++;
  }

  /* ---------------- SETTINGS ---------------- */

  await saveSettings(state.settings);
  results.settings = true;

  return results;
}

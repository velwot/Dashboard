import { supabase } from "./supabase.js";

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User is not authenticated.");

  return user;
}

function externalId(row) {
  return row.external_id || row.id;
}

/* ============================================================
   PROFILE
   ============================================================ */

export async function getProfile() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) return null;

  return {
    name: data.name || "",
    degree: data.degree || "BE ICT",
    startYear: data.start_year || new Date().getFullYear(),
    target: data.target_direction || "",
    currentYear: data.current_year || 1,
  };
}

export async function saveProfile(profile) {
  const user = await requireUser();

  const row = {
    id: user.id,
    name: profile.name || "",
    degree: profile.degree || "BE ICT",
    start_year: Number(profile.startYear) || new Date().getFullYear(),
    target_direction:
      profile.target || "AI Systems / AI Engineering + Systems",
    current_year: Number(profile.currentYear) || 1,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row)
    .select()
    .single();

  if (error) throw error;

  return {
    name: data.name || "",
    degree: data.degree || "BE ICT",
    startYear: data.start_year,
    target: data.target_direction || "",
    currentYear: data.current_year || 1,
  };
}

/* ============================================================
   TASK PROGRESS — PUBLIC ROADMAP TASKS
   ============================================================ */

export async function getTaskProgress() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("task_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) throw error;

  const state = {};

  for (const row of data || []) {
    state[row.task_id] = {
      status: row.status,
      notes: row.notes || "",
      completed_at: row.completed_at,
    };
  }

  return state;
}

export async function saveTaskProgress(
  taskId,
  status,
  notes = ""
) {
  const user = await requireUser();

  const row = {
    user_id: user.id,
    task_id: String(taskId),
    status,
    notes,
    completed_at:
      status === "done"
        ? new Date().toISOString()
        : null,
  };

  const { data, error } = await supabase
    .from("task_progress")
    .upsert(row, {
      onConflict: "user_id,task_id",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

/* ============================================================
   GENERIC USER DATA
   ============================================================ */

async function listOwned(table, order = "created_at") {
  await requireUser();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(order, { ascending: false });

  if (error) throw error;

  return data || [];
}

async function insertOwned(table, row) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(table)
    .insert({
      ...row,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function updateOwned(table, id, row) {
  await requireUser();

  const { data, error } = await supabase
    .from(table)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function deleteOwned(table, id) {
  await requireUser();

  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* ============================================================
   FIND BY EXTERNAL ID
   ============================================================ */

async function findByExternalId(table, externalIdValue) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("user_id", user.id)
    .eq("external_id", String(externalIdValue))
    .maybeSingle();

  if (error) throw error;

  return data;
}

/* ============================================================
   UPSERT USING THE APP'S EXISTING ID
   ============================================================ */

async function upsertByExternalId(
  table,
  externalIdValue,
  row
) {
  const existing = await findByExternalId(
    table,
    externalIdValue
  );

  if (existing) {
    return updateOwned(table, existing.id, {
      ...row,
      external_id: String(externalIdValue),
    });
  }

  return insertOwned(table, {
    ...row,
    external_id: String(externalIdValue),
  });
}

/* ============================================================
   CUSTOM TASKS
   ============================================================ */

function taskFromDb(row) {
  return {
    id: externalId(row),
    title: row.title,
    category: row.category || "",
    year: row.year || 1,
    priority: row.priority || "medium",
    due: row.due_date || "",
    status: row.status || "todo",
    link: row.link || "",
    notes: row.notes || "",
  };
}

export async function getTasks() {
  const rows = await listOwned("tasks");

  return rows.map(taskFromDb);
}

export async function saveTask(task) {
  return upsertByExternalId("tasks", task.id, {
    title: task.title,
    category: task.category || "",
    year: Number(task.year) || 1,
    due_date: task.due || null,
    status: task.status || "todo",
    priority: task.priority || "medium",
    link: task.link || null,
    notes: task.notes || null,
  });
}

export async function deleteTaskByExternalId(id) {
  const row = await findByExternalId("tasks", id);

  if (!row) return;

  await deleteOwned("tasks", row.id);
}

/* ============================================================
   PROJECTS
   ============================================================ */

function projectFromDb(row) {
  return {
    id: externalId(row),
    title: row.title,
    problem: row.problem || "",
    stack: row.stack || "",
    year: row.year || 1,
    status: row.status || "active",
    role: row.role || "",
    result: row.result || "",
    link: row.github_url || row.demo_url || "",
  };
}

export async function getProjects() {
  const rows = await listOwned("projects");
  return rows.map(projectFromDb);
}

export async function saveProject(project) {
  return upsertByExternalId("projects", project.id, {
    title: project.title,
    problem: project.problem || null,
    stack: project.stack || null,
    role: project.role || null,
    result: project.result || null,
    year: Number(project.year) || 1,
    status: project.status || "active",
    github_url: project.link || null,
  });
}

export async function deleteProject(id) {
  const row = await findByExternalId("projects", id);
  if (row) await deleteOwned("projects", row.id);
}

/* ============================================================
   PEOPLE / NETWORK
   ============================================================ */

function personFromDb(row) {
  return {
    id: externalId(row),
    name: row.name,
    role: row.role || "",
    met: row.how_met || "",
    last: row.last_contact || "",
    next: row.next_action || "",
    notes: row.notes || "",
  };
}

export async function getPeople() {
  const rows = await listOwned("people");
  return rows.map(personFromDb);
}

export async function savePerson(person) {
  return upsertByExternalId("people", person.id, {
    name: person.name,
    role: person.role || null,
    how_met: person.met || null,
    last_contact: person.last || null,
    next_action: person.next || null,
    notes: person.notes || null,
  });
}

export async function deletePerson(id) {
  const row = await findByExternalId("people", id);
  if (row) await deleteOwned("people", row.id);
}

/* ============================================================
   OPPORTUNITIES
   ============================================================ */

function opportunityFromDb(row) {
  return {
    id: externalId(row),
    title: row.title,
    type: row.type,
    company: row.organization || "",
    year: row.year || 1,
    deadline: row.deadline || "",
    followUpDate: row.follow_up_date || "",
    stage: row.stage || "discovered",
    status: row.status || "open",
    fit: row.fit || 0,
    proofValue: row.proof_value || 0,
    learningValue: row.learning_value || 0,
    contact: row.contact || "",
    applyUrl: row.apply_url || "",
    sourceUrl: row.source_url || "",
    notes: row.why_it_matters || row.notes || "",
  };
}

export async function getOpportunities() {
  const rows = await listOwned("opportunities");
  return rows.map(opportunityFromDb);
}

export async function saveOpportunity(opportunity) {
  return upsertByExternalId(
    "opportunities",
    opportunity.id,
    {
      title: opportunity.title,
      type: opportunity.type || "Other",
      organization: opportunity.company || null,
      year: Number(opportunity.year) || 1,
      deadline: opportunity.deadline || null,
      follow_up_date: opportunity.followUpDate || null,
      stage: opportunity.stage || "discovered",
      status: opportunity.status || "open",
      fit: Number(opportunity.fit) || 0,
      proof_value: Number(opportunity.proofValue) || 0,
      learning_value:
        Number(opportunity.learningValue) || 0,
      contact: opportunity.contact || null,
      apply_url: opportunity.applyUrl || null,
      source_url: opportunity.sourceUrl || null,
      why_it_matters: opportunity.notes || null,
      notes: opportunity.notes || null,
    }
  );
}

export async function deleteOpportunity(id) {
  const row = await findByExternalId("opportunities", id);
  if (row) await deleteOwned("opportunities", row.id);
}

/* ============================================================
   EVIDENCE / PROOF
   ============================================================ */

const EVIDENCE_TYPES = {
  project: "Project",
  internship: "Internship",
  "open source": "Open Source",
  competition: "Competition",
  hackathon: "Hackathon",
  research: "Research",
  publication: "Publication",
  talk: "Talk",
  award: "Award",
  users: "Users",
  recommendation: "Other",
  other: "Other",
};

function evidenceFromDb(row) {
  return {
    id: externalId(row),
    title: row.title,
    type: String(row.type || "Other").toLowerCase(),
    result: row.result || "",
    link: row.link || "",
    date: row.date || "",
  };
}

export async function getEvidence() {
  const rows = await listOwned("evidence");
  return rows.map(evidenceFromDb);
}

export async function saveEvidence(item) {
  return upsertByExternalId("evidence", item.id, {
    title: item.title,
    type:
      EVIDENCE_TYPES[String(item.type || "other").toLowerCase()]
      || "Other",
    result: item.result || null,
    link: item.link || null,
    date: item.date || null,
  });
}

export async function deleteEvidence(id) {
  const row = await findByExternalId("evidence", id);
  if (row) await deleteOwned("evidence", row.id);
}

/* ============================================================
   WEEKLY REVIEWS
   ============================================================ */

function reviewFromDb(row) {
  return {
    id: externalId(row),
    date: row.review_date,
    q1: row.shipped || "",
    q2: row.capability || "",
    q3: row.proof_network_opportunity || "",
    q4: row.fake_productivity || "",
    q5: row.next_actions || "",
  };
}

export async function getReviews() {
  const rows = await listOwned("reviews", "review_date");
  return rows.map(reviewFromDb);
}

export async function saveReview(review) {
  return upsertByExternalId("reviews", review.id, {
    review_date: review.date,
    shipped: review.q1 || null,
    capability: review.q2 || null,
    proof_network_opportunity: review.q3 || null,
    fake_productivity: review.q4 || null,
    next_actions: review.q5 || null,
  });
}

export async function deleteReview(id) {
  const row = await findByExternalId("reviews", id);
  if (row) await deleteOwned("reviews", row.id);
}

/* ============================================================
   LOAD COMPLETE PRIVATE STATE
   ============================================================ */

export async function loadCloudState() {
  const [
    profile,
    taskState,
    tasks,
    projects,
    people,
    opportunities,
    evidence,
    reviews,
  ] = await Promise.all([
    getProfile(),
    getTaskProgress(),
    getTasks(),
    getProjects(),
    getPeople(),
    getOpportunities(),
    getEvidence(),
    getReviews(),
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
  };
}/* ============================================================
   NOTES
   ============================================================ */

export async function getNotes() {
  const rows = await listOwned("notes");

  return rows.map(row => ({
    id: row.external_id,
    title: row.title || "",
    body: row.body || "",
    tags: row.tags || [],
  }));
}

export async function saveNote(note) {
  const existing = await supabase
    .from("notes")
    .select("id")
    .eq("user_id", (await requireUser()).id)
    .eq("external_id", String(note.id))
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  const payload = {
    title: note.title || "",
    body: note.body || "",
    tags: Array.isArray(note.tags) ? note.tags : [],
  };

  if (existing.data) {
    return updateOwned("notes", existing.data.id, payload);
  }

  return insertOwned("notes", {
    ...payload,
    external_id: String(note.id),
  });
}

export async function deleteNote(id) {
  const existing = await supabase
    .from("notes")
    .select("id")
    .eq("user_id", (await requireUser()).id)
    .eq("external_id", String(id))
    .maybeSingle();

  if (existing.error) {
    throw existing.error;
  }

  if (existing.data) {
    await deleteOwned("notes", existing.data.id);
  }
}

/* ============================================================
   USER SETTINGS
   ============================================================ */

export async function getSettings() {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data
    ? {
        focusYear: data.focus_year,
      }
    : null;
}

export async function saveSettings(settings) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      focus_year: Number(settings.focusYear) || 1,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    focusYear: data.focus_year,
  };
}
/* ============================================================
   NOTES
   ============================================================ */


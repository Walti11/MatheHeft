import { comboKey } from "@/lib/gameEngine";

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export async function getProfiles(supabase, parentId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createProfile(supabase, parentId, name) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ parent_id: parentId, name, avatar: "⭐" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfileAvatar(supabase, profileId, avatar) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------------------------------------------ */
/* Verlauf & Bestzeiten                                                */
/* ------------------------------------------------------------------ */

export async function getProfileHistory(supabase, profileId, limit = 80) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    date: row.created_at,
    stageKey: row.stage_key,
    category: row.category,
    diffKey: row.diff_key,
    blockSize: row.block_size,
    mulSeries: row.mul_series,
    correct: row.correct,
    total: row.total,
    note: Number(row.note),
    timeSeconds: Number(row.time_seconds),
    tasks: row.tasks,
  }));
}

export async function getBestTimes(supabase, profileId) {
  const { data, error } = await supabase
    .from("best_times")
    .select("*")
    .eq("profile_id", profileId);
  if (error) throw error;
  const map = {};
  data.forEach((row) => {
    const [stageKey, category, diffKey, blockSize, mulSeries] = row.combo_key.split("|");
    map[row.combo_key] = {
      seconds: Number(row.seconds),
      date: row.achieved_at,
      stageKey,
      category,
      diffKey,
      blockSize: Number(blockSize),
      mulSeries: mulSeries === "x" ? null : Number(mulSeries),
    };
  });
  return map;
}

/* ------------------------------------------------------------------ */
/* Ergebnis eines Rechnungsblocks speichern                            */
/* ------------------------------------------------------------------ */

export async function saveSessionResult(supabase, { profileId, runConfig, sessionResult, correct, total, note, pointsEarned }) {
  const { error: sessionError } = await supabase.from("sessions").insert({
    profile_id: profileId,
    stage_key: runConfig.stageKey,
    category: runConfig.category,
    diff_key: runConfig.diffKey,
    block_size: runConfig.blockSize,
    mul_series: runConfig.mulSeries || null,
    correct,
    total,
    note,
    time_seconds: sessionResult.timeSeconds,
    tasks: sessionResult.tasks,
  });
  if (sessionError) throw sessionError;

  const { data: newPoints, error: pointsError } = await supabase.rpc("add_points", {
    p_profile_id: profileId,
    p_delta: pointsEarned,
  });
  if (pointsError) throw pointsError;

  let isNewBest = false;
  if (correct === total) {
    const key = comboKey(runConfig.stageKey, runConfig.category, runConfig.diffKey, runConfig.blockSize, runConfig.mulSeries);
    const { data: existing, error: bestError } = await supabase
      .from("best_times")
      .select("seconds")
      .eq("profile_id", profileId)
      .eq("combo_key", key)
      .maybeSingle();
    if (bestError) throw bestError;

    if (!existing || sessionResult.timeSeconds < existing.seconds) {
      isNewBest = true;
      const { error: upsertError } = await supabase
        .from("best_times")
        .upsert(
          { profile_id: profileId, combo_key: key, seconds: sessionResult.timeSeconds, achieved_at: new Date().toISOString() },
          { onConflict: "profile_id,combo_key" }
        );
      if (upsertError) throw upsertError;
    }
  }

  return { newPoints, isNewBest };
}

/* ------------------------------------------------------------------ */
/* Geschichten-Modul                                                   */
/* ------------------------------------------------------------------ */

export async function getStoryLibrary(supabase, profileId) {
  const [topicalRes, sagasRes] = await Promise.all([
    supabase
      .from("story_chapters")
      .select("*")
      .eq("profile_id", profileId)
      .eq("mode", "topical")
      .order("created_at", { ascending: false }),
    supabase
      .from("story_sagas")
      .select("*")
      .eq("profile_id", profileId)
      .order("updated_at", { ascending: false }),
  ]);
  if (topicalRes.error) throw topicalRes.error;
  if (sagasRes.error) throw sagasRes.error;
  return { topicalStories: topicalRes.data, sagas: sagasRes.data };
}

export async function getSagaChapters(supabase, sagaId) {
  const { data, error } = await supabase
    .from("story_chapters")
    .select("*")
    .eq("saga_id", sagaId)
    .order("chapter_number", { ascending: true });
  if (error) throw error;
  return data;
}

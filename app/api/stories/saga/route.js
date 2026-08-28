import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findLevel, buildSagaPrompt } from "@/lib/storyEngine";
import { generateSagaChapter } from "@/lib/gemini";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { profileId, characters, levelKey, adventureHint } = await request.json();
  const cleanCharacters = (characters || []).map((c) => c.trim()).filter(Boolean);
  if (!profileId || cleanCharacters.length === 0 || !levelKey) {
    return NextResponse.json({ error: "profileId, mindestens eine Figur und levelKey sind erforderlich." }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .single();
  if (profileError || !profile) {
    return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  }

  const level = findLevel(levelKey);

  let result;
  try {
    result = await generateSagaChapter(
      buildSagaPrompt({ characters: cleanCharacters, level, adventureHint, isFirstChapter: true, chapterNumber: 1 })
    );
  } catch (err) {
    return NextResponse.json({ error: err.message || "Geschichte konnte nicht erstellt werden." }, { status: 502 });
  }

  const { data: saga, error: sagaError } = await supabase
    .from("story_sagas")
    .insert({
      profile_id: profileId,
      title: result.sagaTitle || result.chapterTitle,
      characters: cleanCharacters,
      summary: result.updatedSummary,
      chapter_count: 1,
    })
    .select()
    .single();
  if (sagaError) {
    return NextResponse.json({ error: sagaError.message }, { status: 500 });
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("story_chapters")
    .insert({
      profile_id: profileId,
      saga_id: saga.id,
      mode: "saga",
      level_key: levelKey,
      chapter_number: 1,
      title: result.chapterTitle,
      content: result.story,
      new_words: result.newWords || [],
    })
    .select()
    .single();
  if (chapterError) {
    return NextResponse.json({ error: chapterError.message }, { status: 500 });
  }

  return NextResponse.json({ saga, chapter });
}

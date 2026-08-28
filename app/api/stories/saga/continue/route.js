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

  const { sagaId, levelKey } = await request.json();
  if (!sagaId || !levelKey) {
    return NextResponse.json({ error: "sagaId und levelKey sind erforderlich." }, { status: 400 });
  }

  const { data: saga, error: sagaError } = await supabase
    .from("story_sagas")
    .select("*")
    .eq("id", sagaId)
    .single();
  if (sagaError || !saga) {
    return NextResponse.json({ error: "Serie nicht gefunden." }, { status: 404 });
  }

  const level = findLevel(levelKey);
  const nextChapterNumber = saga.chapter_count + 1;

  let result;
  try {
    result = await generateSagaChapter(
      buildSagaPrompt({
        characters: saga.characters,
        level,
        isFirstChapter: false,
        previousSummary: saga.summary,
        chapterNumber: nextChapterNumber,
      })
    );
  } catch (err) {
    return NextResponse.json({ error: err.message || "Kapitel konnte nicht erstellt werden." }, { status: 502 });
  }

  const { data: chapter, error: chapterError } = await supabase
    .from("story_chapters")
    .insert({
      profile_id: saga.profile_id,
      saga_id: saga.id,
      mode: "saga",
      level_key: levelKey,
      chapter_number: nextChapterNumber,
      title: result.chapterTitle,
      content: result.story,
      new_words: result.newWords || [],
    })
    .select()
    .single();
  if (chapterError) {
    return NextResponse.json({ error: chapterError.message }, { status: 500 });
  }

  const { data: updatedSaga, error: updateError } = await supabase
    .from("story_sagas")
    .update({
      summary: result.updatedSummary,
      chapter_count: nextChapterNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", saga.id)
    .select()
    .single();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ saga: updatedSaga, chapter });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findTopic, findLevel, buildTopicalPrompt } from "@/lib/storyEngine";
import { generateTopicalStory } from "@/lib/gemini";

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { profileId, topicKey, levelKey } = await request.json();
  if (!profileId || !topicKey || !levelKey) {
    return NextResponse.json({ error: "profileId, topicKey und levelKey sind erforderlich." }, { status: 400 });
  }

  // Gehört das Profil wirklich zur eingeloggten Familie? (RLS greift zusätzlich beim Insert.)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .single();
  if (profileError || !profile) {
    return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  }

  const topic = findTopic(topicKey);
  const level = findLevel(levelKey);

  let result;
  try {
    result = await generateTopicalStory(buildTopicalPrompt({ topic, level }));
  } catch (err) {
    return NextResponse.json({ error: err.message || "Geschichte konnte nicht erstellt werden." }, { status: 502 });
  }

  const { data: chapter, error: insertError } = await supabase
    .from("story_chapters")
    .insert({
      profile_id: profileId,
      saga_id: null,
      mode: "topical",
      topic_key: topicKey,
      level_key: levelKey,
      chapter_number: 1,
      title: result.title,
      content: result.story,
      new_words: result.newWords || [],
    })
    .select()
    .single();
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ chapter });
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Etwas ist schiefgelaufen.");
  return data;
}

export function requestTopicalStory({ profileId, topicKey, levelKey }) {
  return postJson("/api/stories/topical", { profileId, topicKey, levelKey });
}

export function requestNewSaga({ profileId, characters, levelKey, adventureHint }) {
  return postJson("/api/stories/saga", { profileId, characters, levelKey, adventureHint });
}

export function requestNextChapter({ sagaId, levelKey }) {
  return postJson("/api/stories/saga/continue", { sagaId, levelKey });
}

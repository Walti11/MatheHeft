"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getProfiles, createProfile, updateProfileAvatar, getProfileHistory, getBestTimes,
  getStoryLibrary, getSagaChapters,
} from "@/lib/data";
import { requestTopicalStory, requestNewSaga, requestNextChapter } from "@/lib/storyApi";

import HolePunches from "@/components/HolePunches";
import TopBar from "@/components/TopBar";
import ProfilesScreen from "@/components/ProfilesScreen";
import MenuScreen from "@/components/MenuScreen";
import SelectScreen from "@/components/SelectScreen";
import PlayScreen from "@/components/PlayScreen";
import ResultScreen from "@/components/ResultScreen";
import StatsScreen from "@/components/StatsScreen";
import RewardsScreen from "@/components/RewardsScreen";
import StoriesScreen from "@/components/StoriesScreen";
import TopicalSetupScreen from "@/components/TopicalSetupScreen";
import SagaSetupScreen from "@/components/SagaSetupScreen";
import StoryReaderScreen from "@/components/StoryReaderScreen";

const BACK_TARGETS = {
  select: "menu", stats: "menu", rewards: "menu", stories: "menu",
  storyTopicalSetup: "stories", storySagaSetup: "stories", storyReader: "stories",
  menu: "profiles", result: "menu",
};

export default function AppShell({ userId }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [screen, setScreen] = useState("profiles");
  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileData, setProfileData] = useState({ points: 0, history: [], bestTimes: {} });
  const [config, setConfig] = useState({
    stageKey: "k1", category: "add", diffKey: "mittel", blockSize: 20,
    overrideAS: null, overrideMul: null, mulMode: "mixed", mulSeries: 2,
  });
  const [runConfig, setRunConfig] = useState(null);
  const [sessionResult, setSessionResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [storyLibrary, setStoryLibrary] = useState(null);
  const [storyLoadingLibrary, setStoryLoadingLibrary] = useState(false);
  const [storyMode, setStoryMode] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentSaga, setCurrentSaga] = useState(null);
  const [sagaChapters, setSagaChapters] = useState([]);
  const [storyGenerating, setStoryGenerating] = useState(false);
  const [storyError, setStoryError] = useState(null);

  useEffect(() => {
    getProfiles(supabase, userId).then((p) => {
      setProfiles(p);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProfile = async (p) => {
    setLoading(true);
    const [history, bestTimes] = await Promise.all([
      getProfileHistory(supabase, p.id),
      getBestTimes(supabase, p.id),
    ]);
    setProfile(p);
    setProfileData({ points: p.points, history, bestTimes });
    setStoryLibrary(null);
    setScreen("menu");
    setLoading(false);
  };

  const handleCreateProfile = async (name) => {
    const p = await createProfile(supabase, userId, name);
    setProfiles((prev) => [...prev, p]);
    await selectProfile(p);
  };

  const chooseAvatar = async (emoji) => {
    const updated = await updateProfileAvatar(supabase, profile.id, emoji);
    setProfile(updated);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const startRun = (rc) => {
    setRunConfig(rc);
    setScreen("play");
  };

  const finishRun = (res) => {
    setSessionResult(res);
    setScreen("result");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  /* ---------------------------------------------------------------- */
  /* Geschichten-Modul                                                 */
  /* ---------------------------------------------------------------- */

  const openStories = async () => {
    setScreen("stories");
    setStoryLoadingLibrary(true);
    const lib = await getStoryLibrary(supabase, profile.id);
    setStoryLibrary(lib);
    setStoryLoadingLibrary(false);
  };

  const generateTopical = async (topicKey, levelKey) => {
    setStoryGenerating(true);
    setStoryError(null);
    try {
      const { chapter } = await requestTopicalStory({ profileId: profile.id, topicKey, levelKey });
      setCurrentChapter(chapter);
      setCurrentSaga(null);
      setSagaChapters([]);
      setStoryMode("topical");
      setStoryLibrary((prev) => ({
        topicalStories: [chapter, ...(prev?.topicalStories || [])],
        sagas: prev?.sagas || [],
      }));
      setScreen("storyReader");
    } catch (err) {
      setStoryError(err.message);
    } finally {
      setStoryGenerating(false);
    }
  };

  const createNewSaga = async (characters, levelKey, hint) => {
    setStoryGenerating(true);
    setStoryError(null);
    try {
      const { saga, chapter } = await requestNewSaga({ profileId: profile.id, characters, levelKey, adventureHint: hint });
      setCurrentSaga(saga);
      setCurrentChapter(chapter);
      setSagaChapters([chapter]);
      setStoryMode("saga");
      setStoryLibrary((prev) => ({
        topicalStories: prev?.topicalStories || [],
        sagas: [saga, ...(prev?.sagas || [])],
      }));
      setScreen("storyReader");
    } catch (err) {
      setStoryError(err.message);
    } finally {
      setStoryGenerating(false);
    }
  };

  const openTopicalStory = (story) => {
    setStoryError(null);
    setCurrentChapter(story);
    setCurrentSaga(null);
    setSagaChapters([]);
    setStoryMode("topical");
    setScreen("storyReader");
  };

  const openSaga = async (saga) => {
    setStoryError(null);
    const chapters = await getSagaChapters(supabase, saga.id);
    setSagaChapters(chapters);
    setCurrentSaga(saga);
    setCurrentChapter(chapters[chapters.length - 1]);
    setStoryMode("saga");
    setScreen("storyReader");
  };

  const selectChapter = (chapterId) => {
    const c = sagaChapters.find((ch) => ch.id === chapterId);
    if (c) setCurrentChapter(c);
  };

  const nextChapter = async () => {
    setStoryGenerating(true);
    setStoryError(null);
    try {
      const { saga, chapter } = await requestNextChapter({ sagaId: currentSaga.id, levelKey: currentChapter.level_key });
      setCurrentSaga(saga);
      setSagaChapters((prev) => [...prev, chapter]);
      setCurrentChapter(chapter);
      setStoryLibrary((prev) => ({
        topicalStories: prev?.topicalStories || [],
        sagas: (prev?.sagas || []).map((s) => (s.id === saga.id ? saga : s)),
      }));
    } catch (err) {
      setStoryError(err.message);
    } finally {
      setStoryGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="mh-root">
        <HolePunches />
        <div className="mh-page mh-loading-page"><p className="mh-subtle">Lade…</p></div>
      </div>
    );
  }

  return (
    <div className="mh-root">
      <HolePunches />
      <TopBar
        profile={screen !== "profiles" ? profile : null}
        screen={screen}
        points={profileData.points}
        onHome={() => setScreen(profile ? "menu" : "profiles")}
        onSignOut={signOut}
        onBack={() => setScreen(BACK_TARGETS[screen] || "menu")}
      />

      {screen === "profiles" && (
        <ProfilesScreen profiles={profiles} onSelect={selectProfile} onCreate={handleCreateProfile} />
      )}
      {screen === "menu" && profile && (
        <MenuScreen profile={profile} points={profileData.points} onNav={(s) => (s === "stories" ? openStories() : setScreen(s))} />
      )}
      {screen === "select" && (
        <SelectScreen config={config} setConfig={setConfig} onStart={startRun} />
      )}
      {screen === "play" && runConfig && (
        <PlayScreen
          runConfig={runConfig}
          onFinish={finishRun}
          onAbort={() => setScreen("select")}
        />
      )}
      {screen === "result" && sessionResult && runConfig && (
        <ResultScreen
          runConfig={runConfig}
          sessionResult={sessionResult}
          profileData={profileData}
          setProfileData={setProfileData}
          profileId={profile.id}
          onAgain={() => setScreen("play")}
          onMenu={() => setScreen("menu")}
        />
      )}
      {screen === "stats" && <StatsScreen profileData={profileData} />}
      {screen === "rewards" && (
        <RewardsScreen points={profileData.points} profile={profile} onChooseAvatar={chooseAvatar} />
      )}

      {screen === "stories" && (
        <StoriesScreen
          library={storyLibrary}
          loadingLibrary={storyLoadingLibrary}
          onNewTopical={() => { setStoryError(null); setScreen("storyTopicalSetup"); }}
          onNewSaga={() => { setStoryError(null); setScreen("storySagaSetup"); }}
          onOpenTopical={openTopicalStory}
          onOpenSaga={openSaga}
        />
      )}
      {screen === "storyTopicalSetup" && (
        <TopicalSetupScreen onGenerate={generateTopical} generating={storyGenerating} error={storyError} />
      )}
      {screen === "storySagaSetup" && (
        <SagaSetupScreen onCreate={createNewSaga} generating={storyGenerating} error={storyError} />
      )}
      {screen === "storyReader" && currentChapter && (
        <StoryReaderScreen
          mode={storyMode}
          chapter={currentChapter}
          saga={currentSaga}
          chapters={sagaChapters}
          onSelectChapter={selectChapter}
          onNextChapter={nextChapter}
          generatingNext={storyGenerating}
          error={storyError}
        />
      )}
    </div>
  );
}

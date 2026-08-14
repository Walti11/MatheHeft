"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProfiles, createProfile, updateProfileAvatar, getProfileHistory, getBestTimes } from "@/lib/data";

import HolePunches from "@/components/HolePunches";
import TopBar from "@/components/TopBar";
import ProfilesScreen from "@/components/ProfilesScreen";
import MenuScreen from "@/components/MenuScreen";
import SelectScreen from "@/components/SelectScreen";
import PlayScreen from "@/components/PlayScreen";
import ResultScreen from "@/components/ResultScreen";
import StatsScreen from "@/components/StatsScreen";
import RewardsScreen from "@/components/RewardsScreen";

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
        onBack={() => {
          if (screen === "select" || screen === "stats" || screen === "rewards") setScreen("menu");
          else if (screen === "menu") setScreen("profiles");
          else if (screen === "result") setScreen("menu");
          else setScreen("menu");
        }}
      />

      {screen === "profiles" && (
        <ProfilesScreen profiles={profiles} onSelect={selectProfile} onCreate={handleCreateProfile} />
      )}
      {screen === "menu" && profile && (
        <MenuScreen profile={profile} points={profileData.points} onNav={setScreen} />
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
    </div>
  );
}

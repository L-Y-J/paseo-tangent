import type { PluginAgentPanelProps } from "@getpaseo/plugin/client";
import { TextInput } from "@getpaseo/plugin/client/ui";
import { useSyncExternalStore, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { store } from "./store";

// Paseo gives a plugin no row menu, so the cut point is picked here: one row per prompt in
// the copied window, and the fork starts right after it.
export function ForkPanel({ params, navigation, theme }: PluginAgentPanelProps) {
  useSyncExternalStore(store.subscribe, store.version);
  const [draft, setDraft] = useState("");
  const state = store.anchors(params.agentId);
  const colors = theme.colors;
  const text = { color: colors.foreground };
  const muted = { color: colors.foregroundMuted };

  if (state.status === "idle") void store.loadAnchors(params.agentId);

  const fork = async (anchorId: string) => {
    const created = await store.forkAt(params.agentId, anchorId, draft.trim());
    if (!created) return;
    // The desktop opens the tab itself; other clients fall back to the panel's navigation.
    if (!created.opened && navigation) navigation.openAgent({ agentId: created.agentId });
    setDraft("");
  };

  return (
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[text, { fontWeight: "600" }]}>Fork at a message</Text>
        <Pressable onPress={() => void store.loadAnchors(params.agentId)}>
          <Text style={muted}>Reload</Text>
        </Pressable>
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Prompt for the fork (optional)"
        style={[text, { borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8 }]}
      />
      {state.status === "error" ? <Text style={{ color: colors.statusDanger }}>{state.error}</Text> : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 6 }}>
        {state.anchors.length ? (
          state.anchors.map((anchor) => (
            <Pressable
              key={anchor.id}
              onPress={() => void fork(anchor.id)}
              disabled={state.busyId !== null}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                padding: 8,
                opacity: state.busyId && state.busyId !== anchor.id ? 0.4 : 1,
              }}
            >
              <Text style={[text, { fontSize: 12 }]} selectable>
                {anchor.preview}
              </Text>
              <Text style={[muted, { fontSize: 11 }]}>
                {state.busyId === anchor.id ? "Forking..." : "Fork from here"}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={muted}>
            {state.status === "loading" ? "Loading prompts..." : "No prompts with an id in the last 200 entries."}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

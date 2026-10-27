import type { PluginAgentPanelProps } from "@getpaseo/plugin/client";
import { TextInput } from "@getpaseo/plugin/client/ui";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { store } from "./store";

export function BtwPanel({ params, navigation, theme }: PluginAgentPanelProps) {
  useSyncExternalStore(store.subscribe, store.version);
  const [draft, setDraft] = useState("");
  const thread = store.thread(params.agentId);
  const colors = theme.colors;
  const text = { color: colors.foreground };
  const muted = { color: colors.foregroundMuted };

  // Forks and branches queued by slash commands open as tabs from here.
  useEffect(() => {
    if (!navigation) return;
    for (const agentId of store.takePendingOpens()) navigation.openAgent({ agentId });
  });

  const submit = () => {
    const question = draft.trim();
    if (!question || thread?.busy) return;
    setDraft("");
    void store.ask(params.agentId, question);
  };

  return (
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[text, { fontWeight: "600" }]}>BTW</Text>
        {thread ? (
          <Pressable onPress={() => void store.reset(params.agentId)}>
            <Text style={muted}>New thread</Text>
          </Pressable>
        ) : null}
      </View>
      {thread?.method === "transcript" ? (
        <Text style={[muted, { fontSize: 12 }]}>Context is a pasted transcript, not a native fork.</Text>
      ) : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12 }}>
        {thread?.exchanges.length ? (
          thread.exchanges.map((exchange, index) => (
            <View key={index} style={{ gap: 4 }}>
              <Text style={[text, { fontWeight: "600" }]} selectable>
                {exchange.question}
              </Text>
              <Text style={exchange.answer ? text : muted} selectable>
                {exchange.answer ?? "Thinking..."}
              </Text>
            </View>
          ))
        ) : (
          <Text style={muted}>Ask a side question. The main agent won't see it.</Text>
        )}
      </ScrollView>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={submit}
        placeholder={thread?.busy ? "Waiting for answer..." : "Follow-up question"}
        editable={!thread?.busy}
        style={[text, { borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8 }]}
      />
    </View>
  );
}

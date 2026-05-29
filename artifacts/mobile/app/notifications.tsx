import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import {
  useListMyNotifications,
  useMarkNotificationRead,
  getListMyNotificationsQueryKey,
} from "@workspace/api-client-react";
import type { Notification } from "@workspace/api-client-react";

function timeAgo(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function iconForType(type: string): { icon: string; bg: string; color: string } {
  if (type.includes("loan") || type.includes("disburse"))
    return { icon: "dollar-sign", bg: "#D1FAE5", color: "#059669" };
  if (type.includes("emi") || type.includes("payment") || type.includes("due"))
    return { icon: "credit-card", bg: "#FEF3C7", color: "#D97706" };
  if (type.includes("kyc") || type.includes("verif"))
    return { icon: "shield", bg: "#EEF2FF", color: "#4F46E5" };
  if (type.includes("approv"))
    return { icon: "check-circle", bg: "#D1FAE5", color: "#059669" };
  return { icon: "bell", bg: "#EEF2FF", color: "#4F46E5" };
}

function NotifItem({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const colors = useColors();
  const { icon, bg, color } = iconForType(notif.type);

  return (
    <TouchableOpacity
      style={[
        styles.item,
        { backgroundColor: notif.read ? colors.card : colors.accent, borderColor: colors.border },
      ]}
      onPress={() => !notif.read && onRead(notif.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {notif.title}
          </Text>
          {!notif.read && <View style={[styles.dot, { backgroundColor: "#4F46E5" }]} />}
        </View>
        <Text style={[styles.body, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notif.body}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {timeAgo(notif.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;
  const queryClient = useQueryClient();

  const { data: notifs, isLoading, isError, refetch } = useListMyNotifications();

  const markRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyNotificationsQueryKey() });
      },
    },
  });

  const unreadCount = notifs?.filter((n) => !n.read).length ?? 0;

  const markAllRead = async () => {
    const unread = notifs?.filter((n) => !n.read) ?? [];
    await Promise.all(unread.map((n) => markRead.mutateAsync({ id: n.id })));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllBtn, { borderColor: colors.border }]}
            onPress={markAllRead}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            Loading notifications…
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: "#FEE2E2" }]}>
            <Feather name="wifi-off" size={28} color="#EF4444" />
          </View>
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>Failed to load</Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : notifs?.length === 0 ? (
        <View style={styles.center}>
          <View style={[styles.emptyIcon, { backgroundColor: "#EEF2FF" }]}>
            <Feather name="bell-off" size={28} color="#4F46E5" />
          </View>
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>No notifications</Text>
          <Text style={[styles.stateText, { color: colors.mutedForeground }]}>
            You're all caught up! Notifications will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: isWeb ? 100 : 90 }}
          refreshControl={undefined}
        >
          {notifs?.map((notif) => (
            <NotifItem
              key={notif.id}
              notif={notif}
              onRead={(id) => markRead.mutate({ id })}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  markAllBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stateTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  stateText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  retryBtn: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28, marginTop: 4 },
  retryText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  item: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  title: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 4 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular" },
});

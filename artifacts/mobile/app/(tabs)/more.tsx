import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  {
    section: "Account",
    items: [
      { icon: "user", label: "Profile", sub: "View and edit your profile" },
      { icon: "shield", label: "KYC Status", sub: "Verified" },
      { icon: "bell", label: "Notifications", sub: "Manage alerts" },
    ],
  },
  {
    section: "Loans",
    items: [
      { icon: "file-text", label: "Loan Statement", sub: "Download statements" },
      { icon: "calendar", label: "Repayment Schedule", sub: "View EMI schedule" },
      { icon: "refresh-cw", label: "Foreclose Loan", sub: "Close your loan early" },
    ],
  },
  {
    section: "Support",
    items: [
      { icon: "help-circle", label: "Help & FAQs", sub: "Get answers" },
      { icon: "message-circle", label: "Contact Us", sub: "Chat or call support" },
      { icon: "star", label: "Rate Us", sub: "Share your experience" },
    ],
  },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>More</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: isWeb ? 34 + 84 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile strip */}
        <View style={[styles.profileStrip, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: colors.foreground }]}>Rahul Sharma</Text>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>rahul.sharma@email.com</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
        </View>

        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={{ marginTop: 16 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.section.toUpperCase()}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <View key={item.label}>
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: "#EEF2FF" }]}>
                      <Feather name={item.icon as any} size={17} color="#4F46E5" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                    </View>
                    <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  {i < section.items.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: "#EF4444" }]}>
          <Feather name="log-out" size={16} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  profileStrip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#4F46E5", fontSize: 22, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  profileEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 8 },
  menuCard: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  divider: { height: 1, marginLeft: 64 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
  },
  logoutText: { color: "#EF4444", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

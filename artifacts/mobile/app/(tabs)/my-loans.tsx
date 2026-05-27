import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useState } from "react";
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

const ALL_LOANS = [
  {
    id: "1",
    type: "Home Loan",
    loanId: "HL12345678",
    outstanding: 10250.0,
    nextEmi: 200.0,
    dueDate: "May 25, 2024",
    progress: 0.6,
    paidEmis: 20,
    totalEmis: 30,
    disbursed: 18000.0,
    startDate: "Jan 01, 2022",
    tenure: "30 months",
    iconColor: "#4F46E5",
    iconBg: "#EEF2FF",
    iconLib: "feather" as const,
    icon: "home",
    status: "Active",
  },
  {
    id: "2",
    type: "Personal Loan",
    loanId: "PL87654321",
    outstanding: 2200.0,
    nextEmi: 50.0,
    dueDate: "Jun 10, 2024",
    progress: 0.8,
    paidEmis: 16,
    totalEmis: 20,
    disbursed: 5000.0,
    startDate: "Apr 01, 2024",
    tenure: "20 months",
    iconColor: "#10B981",
    iconBg: "#D1FAE5",
    iconLib: "fa5" as const,
    icon: "money-bill-wave",
    status: "Active",
  },
];

export default function MyLoansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const [selectedTab, setSelectedTab] = useState("active");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Loans</Text>
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {["active", "closed"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              selectedTab === tab && [styles.filterTabActive, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[
              styles.filterTabText,
              { color: selectedTab === tab ? colors.primary : colors.mutedForeground },
              selectedTab === tab && { fontFamily: "Inter_600SemiBold" },
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isWeb ? 34 + 84 : 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {ALL_LOANS.map((loan) => (
          <TouchableOpacity
            key={loan.id}
            style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <View style={styles.loanTop}>
              <View style={[styles.loanIcon, { backgroundColor: loan.iconBg }]}>
                {loan.iconLib === "feather" ? (
                  <Feather name={loan.icon as any} size={20} color={loan.iconColor} />
                ) : (
                  <FontAwesome5 name={loan.icon as any} size={16} color={loan.iconColor} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.loanType, { color: colors.foreground }]}>{loan.type}</Text>
                <Text style={[styles.loanId, { color: colors.mutedForeground }]}>Loan ID: {loan.loanId}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: "#D1FAE5" }]}>
                <Text style={[styles.badgeText, { color: "#059669" }]}>{loan.status}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  ${loan.outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Next EMI</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>${loan.nextEmi.toFixed(2)}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Due Date</Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{loan.dueDate}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progLabel, { color: colors.mutedForeground }]}>{Math.round(loan.progress * 100)}% Paid</Text>
                <Text style={[styles.progLabel, { color: colors.mutedForeground }]}>{loan.paidEmis} of {loan.totalEmis} EMIs</Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.muted }]}>
                <View style={[styles.bar, { width: `${loan.progress * 100}%` as any, backgroundColor: loan.iconColor }]} />
              </View>
            </View>

            <TouchableOpacity style={[styles.payEmiBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.payEmiBtnText}>Pay EMI</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  filterRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {},
  filterTabText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  loanCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  loanTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  loanIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  loanType: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  loanId: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginBottom: 12 },
  statsRow: { flexDirection: "row", marginBottom: 14 },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 3 },
  statValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  progressSection: { marginBottom: 14 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  bar: { height: 6, borderRadius: 3 },
  payEmiBtn: { borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  payEmiBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

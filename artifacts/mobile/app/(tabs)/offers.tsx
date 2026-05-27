import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const OFFERS = [
  {
    id: "1",
    title: "Personal Loan",
    subtitle: "Up to $50,000",
    rate: "10.5% p.a.",
    tenure: "Up to 60 months",
    tag: "Pre-approved",
    tagColor: "#10B981",
    tagBg: "#D1FAE5",
    gradient: ["#6366F1", "#4F46E5"] as const,
    icon: "💳",
  },
  {
    id: "2",
    title: "Home Loan Top-Up",
    subtitle: "Up to $200,000",
    rate: "8.5% p.a.",
    tenure: "Up to 240 months",
    tag: "Special Rate",
    tagColor: "#F59E0B",
    tagBg: "#FEF3C7",
    gradient: ["#0EA5E9", "#0284C7"] as const,
    icon: "🏠",
  },
  {
    id: "3",
    title: "Education Loan",
    subtitle: "Up to $75,000",
    rate: "9.0% p.a.",
    tenure: "Up to 84 months",
    tag: "New",
    tagColor: "#8B5CF6",
    tagBg: "#EDE9FE",
    gradient: ["#A78BFA", "#7C3AED"] as const,
    icon: "🎓",
  },
];

export default function OffersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Special Offers</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isWeb ? 34 + 84 : 100,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <LinearGradient
          colors={["#5B52E8", "#3730A3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View>
            <Text style={styles.bannerTitle}>Exclusive offers for you!</Text>
            <Text style={styles.bannerSub}>Based on your excellent credit score</Text>
          </View>
          <Text style={{ fontSize: 40 }}>🎁</Text>
        </LinearGradient>

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Available Offers</Text>

        {OFFERS.map((offer) => (
          <View key={offer.id} style={[styles.offerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient
              colors={offer.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.offerHeader}
            >
              <Text style={{ fontSize: 36 }}>{offer.icon}</Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
              </View>
              <View style={[styles.tagBadge, { backgroundColor: offer.tagBg }]}>
                <Text style={[styles.tagText, { color: offer.tagColor }]}>{offer.tag}</Text>
              </View>
            </LinearGradient>
            <View style={styles.offerBody}>
              <View style={styles.offerStat}>
                <Text style={[styles.offerStatLabel, { color: colors.mutedForeground }]}>Interest Rate</Text>
                <Text style={[styles.offerStatValue, { color: colors.foreground }]}>{offer.rate}</Text>
              </View>
              <View style={[styles.offerStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.offerStat}>
                <Text style={[styles.offerStatLabel, { color: colors.mutedForeground }]}>Tenure</Text>
                <Text style={[styles.offerStatValue, { color: colors.foreground }]}>{offer.tenure}</Text>
              </View>
              <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.applyBtnText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  banner: { borderRadius: 14, padding: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bannerTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  bannerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  offerCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  offerHeader: { flexDirection: "row", alignItems: "center", padding: 16 },
  offerTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  offerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tagBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  offerBody: { flexDirection: "row", alignItems: "center", padding: 14, gap: 8 },
  offerStat: { flex: 1 },
  offerStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 2 },
  offerStatValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  offerStatDivider: { width: 1, height: 36 },
  applyBtn: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  applyBtnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function computeEMI(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || annualRate <= 0 || months <= 0) return null;
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  const interest = total - principal;
  return { emi, total, interest };
}

const PRESETS = [
  { label: "Home Loan", amount: "500000", rate: "8.5", tenure: "240" },
  { label: "Personal", amount: "50000", rate: "10.5", tenure: "60" },
  { label: "Car Loan", amount: "150000", rate: "9.0", tenure: "84" },
];

export default function EmiCalculatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("8.5");
  const [tenure, setTenure] = useState("240");

  const result = computeEMI(
    parseFloat(amount) || 0,
    parseFloat(rate) || 0,
    parseInt(tenure) || 0,
  );

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const applyPreset = (p: typeof PRESETS[0]) => {
    setAmount(p.amount);
    setRate(p.rate);
    setTenure(p.tenure);
  };

  const principalPct = result
    ? Math.round((parseFloat(amount) / result.total) * 100)
    : 0;
  const interestPct = result ? 100 - principalPct : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                paddingTop: topPad + 12,
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              EMI Calculator
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Plan your loan repayment
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: isWeb ? 34 + 84 : 110,
              gap: 14,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Presets */}
            <View style={styles.presetsRow}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor:
                        amount === p.amount && rate === p.rate
                          ? colors.primary
                          : colors.card,
                      borderColor:
                        amount === p.amount && rate === p.rate
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => applyPreset(p)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      {
                        color:
                          amount === p.amount && rate === p.rate
                            ? "#fff"
                            : colors.foreground,
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Inputs */}
            <View
              style={[
                styles.inputCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <InputField
                label="Loan Amount"
                value={amount}
                onChangeText={setAmount}
                prefix="$"
                keyboardType="numeric"
                colors={colors}
              />
              <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
              <InputField
                label="Interest Rate (per year)"
                value={rate}
                onChangeText={setRate}
                suffix="% p.a."
                keyboardType="numeric"
                colors={colors}
              />
              <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
              <InputField
                label="Loan Tenure"
                value={tenure}
                onChangeText={setTenure}
                suffix="months"
                keyboardType="numeric"
                colors={colors}
              />
            </View>

            {/* Result card */}
            {result ? (
              <>
                <LinearGradient
                  colors={["#5B52E8", "#3730A3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resultCard}
                >
                  <Text style={styles.resultLabel}>Monthly EMI</Text>
                  <Text style={styles.resultEmi}>${fmt(result.emi)}</Text>
                  <View style={styles.resultDivider} />
                  <View style={styles.resultRow}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultItemLabel}>Principal</Text>
                      <Text style={styles.resultItemValue}>
                        ${fmt(parseFloat(amount) || 0)}
                      </Text>
                    </View>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultItemLabel}>Total Interest</Text>
                      <Text style={styles.resultItemValue}>${fmt(result.interest)}</Text>
                    </View>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultItemLabel}>Total Amount</Text>
                      <Text style={styles.resultItemValue}>${fmt(result.total)}</Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Pie-style breakdown bar */}
                <View
                  style={[
                    styles.breakdownCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.breakdownTitle, { color: colors.foreground }]}>
                    Payment Breakdown
                  </Text>
                  <View style={styles.breakdownBar}>
                    <View
                      style={[
                        styles.breakdownPrincipal,
                        { flex: principalPct, backgroundColor: "#4F46E5" },
                      ]}
                    />
                    <View
                      style={[
                        styles.breakdownInterest,
                        { flex: interestPct, backgroundColor: "#F59E0B" },
                      ]}
                    />
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#4F46E5" }]} />
                      <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>
                        Principal {principalPct}%
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                      <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>
                        Interest {interestPct}%
                      </Text>
                    </View>
                  </View>

                  {/* Amortisation highlights */}
                  <View style={[styles.amorRow, { borderTopColor: colors.border }]}>
                    <View style={styles.amorItem}>
                      <Text style={[styles.amorLabel, { color: colors.mutedForeground }]}>
                        Tenure
                      </Text>
                      <Text style={[styles.amorValue, { color: colors.foreground }]}>
                        {parseInt(tenure) || 0} months
                      </Text>
                    </View>
                    <View style={[styles.amorDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.amorItem}>
                      <Text style={[styles.amorLabel, { color: colors.mutedForeground }]}>
                        Interest Rate
                      </Text>
                      <Text style={[styles.amorValue, { color: colors.foreground }]}>
                        {rate}% p.a.
                      </Text>
                    </View>
                    <View style={[styles.amorDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.amorItem}>
                      <Text style={[styles.amorLabel, { color: colors.mutedForeground }]}>
                        Savings Ratio
                      </Text>
                      <Text style={[styles.amorValue, { color: "#10B981" }]}>
                        {principalPct}%
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.applyBtnText}>Apply for This Loan</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={[
                  styles.emptyResult,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🧮</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  Enter valid values above to calculate your EMI
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  keyboardType,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  prefix?: string;
  suffix?: string;
  keyboardType?: "numeric" | "default";
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.inputValueRow}>
        {prefix && (
          <Text style={[styles.inputAffix, { color: colors.foreground }]}>{prefix}</Text>
        )}
        <TextInput
          style={[styles.textInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? "default"}
          placeholderTextColor={colors.mutedForeground}
          selectTextOnFocus
        />
        {suffix && (
          <Text style={[styles.inputAffix, { color: colors.mutedForeground }]}>{suffix}</Text>
        )}
      </View>
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
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  presetsRow: { flexDirection: "row", gap: 8 },
  presetChip: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 7,
    alignItems: "center",
  },
  presetText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  inputRow: { padding: 14 },
  inputDivider: { height: 1 },
  inputLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 6 },
  inputValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  inputAffix: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  textInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    padding: 0,
  },
  resultCard: { borderRadius: 16, padding: 20 },
  resultLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  resultEmi: { color: "#fff", fontSize: 34, fontFamily: "Inter_700Bold", marginBottom: 16 },
  resultDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 16 },
  resultRow: { flexDirection: "row" },
  resultItem: { flex: 1 },
  resultItemLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
  },
  resultItemValue: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  breakdownCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  breakdownTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  breakdownBar: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 10,
  },
  breakdownPrincipal: { height: 12 },
  breakdownInterest: { height: 12 },
  legendRow: { flexDirection: "row", gap: 20, marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  amorRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: 14,
  },
  amorItem: { flex: 1, alignItems: "center" },
  amorLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  amorValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  amorDivider: { width: 1 },
  applyBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  emptyResult: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
});

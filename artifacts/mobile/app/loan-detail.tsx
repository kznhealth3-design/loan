import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

// ─── Help Modal ───────────────────────────────────────────────────────────────
function HelpModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={mo.overlay} onPress={onClose}>
        <Pressable style={[mo.sheet, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={mo.handle} />
          <View style={mo.header}>
            <Text style={[mo.title, { color: colors.foreground }]}>Help & Support</Text>
            <TouchableOpacity onPress={onClose} style={[mo.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 16 }}>
            Need help with your loan disbursal? Our team is available 24/7 to assist you.
          </Text>
          {[
            { icon: "phone",          color: "#10B981", bg: "#D1FAE5", label: "Call Us",      sub: "1-800-555-0199",     action: "Call support" },
            { icon: "message-circle", color: "#4F46E5", bg: "#EEF2FF", label: "Live Chat",    sub: "Avg. 2 min response",action: "Start live chat" },
            { icon: "mail",           color: "#F59E0B", bg: "#FEF3C7", label: "Email Support", sub: "support@loango.com", action: "Email support" },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={[mo.helpRow, { borderBottomColor: colors.border }]}
              onPress={() => Alert.alert(c.label, `We'll connect you via ${c.label.toLowerCase()}`)}>
              <View style={[mo.helpIcon, { backgroundColor: c.bg }]}>
                <Feather name={c.icon as any} size={20} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[mo.helpLabel, { color: colors.foreground }]}>{c.label}</Text>
                <Text style={[mo.helpSub, { color: colors.mutedForeground }]}>{c.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
const mo = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  helpRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  helpIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  helpLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  helpSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ─── Success Modal ────────────────────────────────────────────────────────────
function SuccessModal({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const ref = `TXN${Date.now().toString().slice(-10)}`;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={[mo.overlay, { justifyContent: "center", padding: 24 }]} onPress={() => {}}>
        <View style={[succ.card, { backgroundColor: colors.card }]}>
          <View style={[succ.iconWrap, { backgroundColor: "#D1FAE5" }]}>
            <Feather name="check-circle" size={48} color="#10B981" />
          </View>
          <Text style={[succ.title, { color: colors.foreground }]}>Transfer Initiated!</Text>
          <Text style={[succ.sub, { color: colors.mutedForeground }]}>
            Your loan amount of $9,93,000.00 will be credited to your bank account within 1–2 business days.
          </Text>
          <View style={[succ.refBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
            <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: "Inter_400Regular" }}>Reference Number</Text>
            <Text style={{ fontSize: 18, color: "#4F46E5", fontFamily: "Inter_700Bold", marginTop: 4 }}>{ref}</Text>
          </View>
          {[
            { label: "Amount",    value: "$9,93,000.00" },
            { label: "Date",      value: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) },
            { label: "Status",    value: "Processing" },
          ].map((r, i) => (
            <View key={i} style={[succ.row, { borderBottomColor: colors.border }]}>
              <Text style={[succ.rowLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
              <Text style={[succ.rowValue, { color: colors.foreground }]}>{r.value}</Text>
            </View>
          ))}
          <TouchableOpacity style={[succ.btn, { backgroundColor: "#4F46E5" }]} onPress={() => { onClose(); router.back(); }}>
            <Text style={succ.btnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
const succ = StyleSheet.create({
  card: { borderRadius: 20, padding: 24, alignItems: "center", width: "100%" },
  iconWrap: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  refBox: { borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", width: "100%", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingVertical: 10, borderBottomWidth: 1 },
  rowLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  btn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 18, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

// ─── Disbursal Step ───────────────────────────────────────────────────────────
function Disbursal({
  steps,
}: {
  steps: { label: string; date: string; done: boolean; number: number }[];
}) {
  const colors = useColors();
  return (
    <View style={{ marginTop: 4 }}>
      {/* Line + circles row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <View style={[
              ds.circle,
              step.done
                ? { backgroundColor: "#4F46E5" }
                : { backgroundColor: "transparent", borderWidth: 2, borderColor: "#4F46E5" },
            ]}>
              {step.done
                ? <Feather name="check" size={12} color="#fff" />
                : <Text style={[ds.circleNum, { color: "#4F46E5" }]}>{step.number}</Text>}
            </View>
            {i < steps.length - 1 && (
              <View style={[ds.line, { backgroundColor: steps[i + 1].done ? "#4F46E5" : "#C7D2FE" }]} />
            )}
          </React.Fragment>
        ))}
      </View>
      {/* Labels row */}
      <View style={{ flexDirection: "row" }}>
        {steps.map((step, i) => (
          <View key={i} style={[ds.label, { flex: 1 }]}>
            <Text style={[ds.stepLabel, { color: step.done ? colors.foreground : "#4F46E5", fontFamily: step.done ? "Inter_600SemiBold" : "Inter_500Medium" }]}>
              {step.label}
            </Text>
            <Text style={[ds.stepDate, { color: step.done ? colors.mutedForeground : "#4F46E5" }]}>{step.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const ds = StyleSheet.create({
  circle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  circleNum: { fontSize: 12, fontFamily: "Inter_700Bold" },
  line: { flex: 1, height: 2 },
  label: { alignItems: "flex-start" },
  stepLabel: { fontSize: 11, lineHeight: 15 },
  stepDate: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
});

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, keyboardType = "default", rightElement,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: any; rightElement?: React.ReactNode;
}) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={[fi.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[fi.box, { borderColor: focused ? "#4F46E5" : colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[fi.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightElement}
      </View>
    </View>
  );
}
const fi = StyleSheet.create({
  label: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 6 },
  box: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, height: 48 },
  input: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
});

// ─── Dropdown Field ───────────────────────────────────────────────────────────
function DropdownField({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <Text style={[fi.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[fi.box, { borderColor: open ? "#4F46E5" : colors.border, backgroundColor: colors.card }]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={[{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" }, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || `Search and select ${label.toLowerCase()}`}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={[df.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={[df.option, { borderBottomColor: colors.border }]}
              onPress={() => { onChange(opt); setOpen(false); }}>
              <Text style={{ fontSize: 13, fontFamily: opt === value ? "Inter_600SemiBold" : "Inter_400Regular", color: opt === value ? "#4F46E5" : colors.foreground }}>{opt}</Text>
              {opt === value && <Feather name="check" size={13} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
const df = StyleSheet.create({
  menu: { position: "absolute", top: 72, left: 0, right: 0, zIndex: 100, borderRadius: 8, borderWidth: 1.5, overflow: "hidden" },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1 },
});

// ─── Summary Row ──────────────────────────────────────────────────────────────
function SummaryRow({ label, value, bold, green, info }: { label: string; value: string; bold?: boolean; green?: boolean; info?: boolean }) {
  const colors = useColors();
  return (
    <View style={[sr.row, { borderBottomColor: colors.border }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Text style={[sr.label, { color: bold ? colors.foreground : colors.mutedForeground, fontFamily: bold ? "Inter_700Bold" : "Inter_400Regular" }]}>
          {label}
        </Text>
        {info && <Feather name="info" size={12} color={colors.mutedForeground} />}
      </View>
      <Text style={[sr.value, { color: green ? "#10B981" : bold ? colors.foreground : colors.foreground, fontFamily: bold ? "Inter_700Bold" : "Inter_400Regular" }]}>
        {value}
      </Text>
    </View>
  );
}
const sr = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1 },
  label: { fontSize: 14 },
  value: { fontSize: 14 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function LoanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const [showHelp,    setShowHelp]    = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ifscVerified, setIfscVerified] = useState(false);

  // Form state
  const [holderName,    setHolderName]    = useState("");
  const [accountNo,     setAccountNo]     = useState("");
  const [confirmAccNo,  setConfirmAccNo]  = useState("");
  const [ifsc,          setIfsc]          = useState("");
  const [bank,          setBank]          = useState("");
  const [accountType,   setAccountType]   = useState("Savings Account");

  const BANKS = [
    "Bank of America",
    "JPMorgan Chase Bank",
    "Wells Fargo Bank",
    "Citibank",
    "US Bank",
    "HomeFirst Bank",
    "PNC Bank",
    "Capital One",
  ];

  const verifyIfsc = () => {
    if (!ifsc || ifsc.length < 6) { Alert.alert("Error", "Please enter a valid IFSC / routing code."); return; }
    setIfscVerified(true);
    Alert.alert("Verified", "IFSC / Routing code verified successfully!");
  };

  const handleTransfer = () => {
    if (!holderName.trim()) { Alert.alert("Required", "Please enter the account holder name."); return; }
    if (!bank) { Alert.alert("Required", "Please select a bank."); return; }
    if (!accountNo.trim() || accountNo.length < 8) { Alert.alert("Required", "Please enter a valid account number."); return; }
    if (accountNo !== confirmAccNo) { Alert.alert("Mismatch", "Account numbers do not match. Please check and try again."); return; }
    if (!ifsc.trim()) { Alert.alert("Required", "Please enter the IFSC / routing code."); return; }
    if (!ifscVerified) { Alert.alert("Unverified", "Please verify your IFSC / routing code before proceeding."); return; }
    setShowSuccess(true);
  };

  const STEPS = [
    { label: "Application\nSubmitted", date: "May 05, 2024", done: true,  number: 1 },
    { label: "Under\nReview",          date: "May 10, 2024", done: true,  number: 2 },
    { label: "Approved",               date: "May 20, 2024", done: true,  number: 3 },
    { label: "Disbursal\nPending",     date: "",             done: false, number: 4 },
  ];

  const approvedAmount = 1000000;
  const processingFee  = 5000;
  const otherCharges   = 2000;
  const disbursalAmt   = approvedAmount - processingFee - otherCharges;

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <View style={[sc.container, { backgroundColor: colors.background }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[sc.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={sc.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[sc.headerTitle, { color: colors.foreground }]}>Loan Details</Text>
        <TouchableOpacity style={sc.helpBtn} onPress={() => setShowHelp(true)}>
          <Feather name="headphones" size={16} color="#4F46E5" />
          <Text style={sc.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: isWeb ? 110 : 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Loan Info Card ────────────────────────────────────────── */}
        <View style={[sc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 }}>
              <View style={[sc.loanIcon, { backgroundColor: "#EEF2FF" }]}>
                <Feather name="home" size={24} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[sc.loanType, { color: colors.foreground }]}>Home Loan</Text>
                <Text style={[sc.loanId, { color: colors.mutedForeground }]}>Loan ID: HL12345678</Text>
                <View style={[sc.approvedBadge, { backgroundColor: "#D1FAE5" }]}>
                  <Feather name="check-circle" size={11} color="#10B981" />
                  <Text style={sc.approvedBadgeText}>Approved</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[sc.approvedOnLabel, { color: colors.mutedForeground }]}>Approved on</Text>
              <Text style={[sc.approvedOnDate, { color: colors.foreground }]}>May 20, 2024</Text>
            </View>
          </View>

          {/* Key metrics */}
          <View style={[sc.metricsDivider, { backgroundColor: colors.border }]} />
          <View style={sc.metricsRow}>
            {[
              { label: "Approved Amount", value: fmt(approvedAmount) },
              { label: "Interest Rate",   value: "8.50% p.a." },
              { label: "Tenure",          value: "20 Years" },
            ].map((m, i) => (
              <View key={i} style={[sc.metric, i > 0 && { borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 12 }]}>
                <Text style={[sc.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                <Text style={[sc.metricValue, { color: colors.foreground }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Congratulations Banner ────────────────────────────────── */}
        <View style={[sc.congrCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
          <View style={[sc.congrIcon, { backgroundColor: "#D1FAE5" }]}>
            <Feather name="check-circle" size={22} color="#10B981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={sc.congrTitle}>Congratulations! Your loan has been approved.</Text>
            <Text style={sc.congrSub}>The approved amount is ready to be disbursed to your bank account.</Text>
          </View>
        </View>

        {/* ── Disbursal Status ──────────────────────────────────────── */}
        <View style={[sc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[sc.cardTitle, { color: colors.foreground }]}>Disbursal Status</Text>
          <Disbursal steps={STEPS} />
        </View>

        {/* ── Transfer to Bank Account ──────────────────────────────── */}
        <View style={[sc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[sc.cardTitle, { color: colors.foreground }]}>Transfer to Bank Account</Text>
          <Text style={[sc.cardSubtitle, { color: colors.mutedForeground }]}>
            Please provide your bank account details to receive the loan amount.
          </Text>

          {/* Row 1: Holder name + Bank */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 14, zIndex: 200 }}>
            <Field
              label="Account Holder Name"
              value={holderName}
              onChange={setHolderName}
              placeholder="Enter account holder name"
            />
          </View>
          <View style={{ marginBottom: 14, zIndex: 100 }}>
            <DropdownField
              label="Select Bank"
              value={bank}
              options={BANKS}
              onChange={setBank}
            />
          </View>

          {/* Row 2: Account number + Confirm */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
            <Field
              label="Account Number"
              value={accountNo}
              onChange={setAccountNo}
              placeholder="Enter account number"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
            <Field
              label="Confirm Account Number"
              value={confirmAccNo}
              onChange={setConfirmAccNo}
              placeholder="Re-enter account number"
              keyboardType="numeric"
            />
          </View>

          {/* Row 3: IFSC + Account type */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
            <Field
              label="IFSC Code"
              value={ifsc}
              onChange={(v) => { setIfsc(v); setIfscVerified(false); }}
              placeholder="Enter IFSC code"
              rightElement={
                <TouchableOpacity onPress={verifyIfsc}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: ifscVerified ? "#10B981" : "#4F46E5" }}>
                    {ifscVerified ? "Verified ✓" : "Verify"}
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
          <View style={{ marginBottom: 14, zIndex: 50 }}>
            <DropdownField
              label="Account Type"
              value={accountType}
              options={["Savings Account", "Current Account", "Salary Account", "NRI Account"]}
              onChange={setAccountType}
            />
          </View>

          {/* Security info bar */}
          <View style={[sc.secBar, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
            <Feather name="shield" size={14} color="#4F46E5" />
            <Text style={sc.secBarText}>Your loan amount will be transferred securely to this bank account.</Text>
          </View>
        </View>

        {/* ── Loan Summary ──────────────────────────────────────────── */}
        <View style={[sc.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[sc.cardTitle, { color: colors.foreground }]}>Loan Summary</Text>
          <SummaryRow label="Approved Amount"   value={fmt(approvedAmount)} />
          <SummaryRow label="Processing Fee"     value={`-${fmt(processingFee)}`}  info />
          <SummaryRow label="Other Charges"      value={`-${fmt(otherCharges)}`}   info />
          <View style={[sc.summaryDivider, { backgroundColor: colors.border }]} />
          <SummaryRow label="Amount to be Disbursed" value={fmt(disbursalAmt)} bold green />
        </View>
      </ScrollView>

      {/* ── Sticky CTA ────────────────────────────────────────────────── */}
      <View style={[sc.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: isWeb ? 16 : insets.bottom + 8 }]}>
        <TouchableOpacity style={[sc.transferBtn, { backgroundColor: "#4F46E5" }]} onPress={handleTransfer} activeOpacity={0.85}>
          <Feather name="send" size={18} color="#fff" />
          <Text style={sc.transferBtnText}>Transfer Amount to Bank</Text>
        </TouchableOpacity>
        <View style={sc.securedRow}>
          <Feather name="lock" size={12} color={colors.mutedForeground} />
          <Text style={[sc.securedText, { color: colors.mutedForeground }]}>Secured &amp; Encrypted Transaction</Text>
        </View>
      </View>

      {showHelp    && <HelpModal    onClose={() => setShowHelp(false)} />}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </View>
  );
}

const sc = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginRight: 6 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  helpBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  helpText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4F46E5" },

  /* Cards */
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 14, lineHeight: 17 },

  /* Loan info */
  loanIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  loanType: { fontSize: 16, fontFamily: "Inter_700Bold" },
  loanId: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, marginBottom: 6 },
  approvedBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  approvedBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#10B981" },
  approvedOnLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  approvedOnDate: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },

  /* Metrics */
  metricsDivider: { height: 1, marginVertical: 14 },
  metricsRow: { flexDirection: "row", gap: 0 },
  metric: { flex: 1, paddingRight: 12 },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 4 },
  metricValue: { fontSize: 14, fontFamily: "Inter_700Bold" },

  /* Congrats */
  congrCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  congrIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  congrTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#059669", marginBottom: 4 },
  congrSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#047857", lineHeight: 17 },

  /* Security bar */
  secBar: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, padding: 12, marginTop: 4 },
  secBarText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: "#4F46E5", lineHeight: 17 },

  /* Summary */
  summaryDivider: { height: 1, marginVertical: 4 },

  /* Footer */
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  transferBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12, paddingVertical: 16 },
  transferBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  securedRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 },
  securedText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

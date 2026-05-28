import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
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

// ─── Types ────────────────────────────────────────────────────────────────────
type EmpType = "salaried" | "self_employed" | "business_owner" | "retired";
type DocStatus = "pending" | "uploaded";

interface Step1Data {
  fullName: string; dob: string; mobile: string; email: string;
  address: string; city: string; existingLoan: "yes" | "no";
  vehicleType: "new" | "used"; studentName: string; institution: string;
  course: string; businessName: string; purpose: string;
}
interface Step2Data {
  empType: EmpType; company: string; income: string;
  experience: string; designation: string;
}
interface Step3Data {
  amount: string; tenure: number; propertyValue: string;
  downPayment: string; carMake: string; courseFee: string; businessRevenue: string;
}
interface DocState { id: DocStatus; address: DocStatus; income: DocStatus; bank: DocStatus; extra: DocStatus; }

// ─── Step Progress ────────────────────────────────────────────────────────────
const STEP_LABELS = ["Personal\nDetails", "Employment\nDetails", "Loan\nDetails", "Documents", "Review &\nSubmit"];

function StepIndicator({ current }: { current: number }) {
  const colors = useColors();
  return (
    <View style={si.wrap}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <React.Fragment key={i}>
            <View style={si.item}>
              <View style={[si.circle,
                done   && { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
                active && { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
                !done && !active && { backgroundColor: colors.card, borderColor: colors.border },
              ]}>
                {done
                  ? <Feather name="check" size={11} color="#fff" />
                  : <Text style={[si.num, { color: active ? "#fff" : colors.mutedForeground }]}>{num}</Text>
                }
              </View>
              <Text style={[si.label, { color: active ? "#4F46E5" : colors.mutedForeground }]}>{label}</Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View style={[si.line, { backgroundColor: num < current ? "#4F46E5" : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}
const si = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 12, paddingBottom: 8 },
  item: { alignItems: "center", width: 56 },
  circle: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  num: { fontSize: 11, fontFamily: "Inter_700Bold" },
  label: { fontSize: 9, fontFamily: "Inter_500Medium", textAlign: "center", lineHeight: 12 },
  line: { flex: 1, height: 1.5, marginTop: 12 },
});

// ─── Reusable Fields ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, keyboardType = "default", multiline = false, icon, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean; icon?: any; hint?: string;
}) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={[f.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[f.box, { borderColor: focused ? "#4F46E5" : colors.border, backgroundColor: colors.card },
        multiline && { height: 80, alignItems: "flex-start" }]}>
        {icon && <Feather name={icon} size={14} color={colors.mutedForeground} style={{ marginRight: 8 }} />}
        <TextInput
          style={[f.input, { color: colors.foreground }, multiline && { height: 64, textAlignVertical: "top" }]}
          value={value} onChangeText={onChange} placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType}
          multiline={multiline} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </View>
      {hint && <Text style={[f.hint, { color: colors.mutedForeground }]}>{hint}</Text>}
    </View>
  );
}
const f = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6 },
  box: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, minHeight: 48, overflow: "hidden" },
  input: { flex: 1, minWidth: 0, fontSize: 14, fontFamily: "Inter_400Regular", paddingVertical: 0, ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}) },
  hint: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3 },
});

function Row2({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 10 }}>{children}</View>;
}

function RadioGroup({ label, value, options, onChange }: {
  label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[f.label, { color: colors.foreground }]}>{label}</Text>
      <Row2>
        {options.map((o) => (
          <TouchableOpacity key={o.id} style={[rg.opt, { borderColor: value === o.id ? "#4F46E5" : colors.border, backgroundColor: colors.card, flex: 1 }]}
            onPress={() => onChange(o.id)}>
            <View style={[rg.dot, { borderColor: value === o.id ? "#4F46E5" : colors.mutedForeground }]}>
              {value === o.id && <View style={rg.fill} />}
            </View>
            <Text style={[rg.optText, { color: colors.foreground }]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </Row2>
    </View>
  );
}
const rg = StyleSheet.create({
  opt: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: 10, padding: 12 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  fill: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4F46E5" },
  optText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});

function SelectField({ label, value, options, onChange, icon }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; icon?: any;
}) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[f.label, { color: colors.foreground }]}>{label}</Text>
      <TouchableOpacity
        style={[f.box, { borderColor: open ? "#4F46E5" : colors.border, backgroundColor: colors.card }]}
        onPress={() => setOpen(!open)}
      >
        {icon && <Feather name={icon} size={14} color={colors.mutedForeground} style={{ marginRight: 8 }} />}
        <Text style={[{ flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" }, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
      {open && (
        <View style={[sel.dropdown, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000" }]}>
          {options.map((o) => (
            <TouchableOpacity key={o} style={[sel.option, { borderBottomColor: colors.border }]}
              onPress={() => { onChange(o); setOpen(false); }}>
              <Text style={[sel.optText, { color: o === value ? "#4F46E5" : colors.foreground }]}>{o}</Text>
              {o === value && <Feather name="check" size={14} color="#4F46E5" />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
const sel = StyleSheet.create({
  dropdown: { borderWidth: 1.5, borderRadius: 10, marginTop: 4, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1 },
  optText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub: string }) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 3 }}>{title}</Text>
      <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{sub}</Text>
    </View>
  );
}

// ─── Security Banner ──────────────────────────────────────────────────────────
function SecurityBanner() {
  const colors = useColors();
  return (
    <View style={[sec.wrap, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
      <View style={[sec.icon, { backgroundColor: "#4F46E5" }]}>
        <Feather name="shield" size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={sec.title}>100% Secure Process</Text>
        <Text style={sec.sub}>Your information is safe with us and will never be shared.</Text>
      </View>
    </View>
  );
}
const sec = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 22 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1F2937" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 2 },
});

// ─── Bottom Progress Banner ───────────────────────────────────────────────────
function QuickAppBanner({ step }: { step: number }) {
  const colors = useColors();
  return (
    <View style={[qb.wrap, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
      <View style={[qb.icon, { backgroundColor: "#4F46E5" }]}>
        <Feather name="file-text" size={14} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={qb.title}>Quick & Easy Application</Text>
        <Text style={qb.sub}>Complete your application in just a few simple steps</Text>
      </View>
      <View style={qb.dots}>
        {[1,2,3,4,5].map((i) => (
          <View key={i} style={[qb.dot, { backgroundColor: i <= step ? "#4F46E5" : "#C7D2FE" }]} />
        ))}
      </View>
    </View>
  );
}
const qb = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14 },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#1F2937" },
  sub: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#6B7280", marginTop: 1 },
  dots: { flexDirection: "row", gap: 4, alignItems: "center" },
  dot: { width: 20, height: 4, borderRadius: 2 },
});

// ─── Upload Doc Row ───────────────────────────────────────────────────────────
function DocRow({ label, sub, status, onUpload }: { label: string; sub: string; status: DocStatus; onUpload: () => void }) {
  const colors = useColors();
  return (
    <View style={[dr.wrap, { backgroundColor: colors.card, borderColor: status === "uploaded" ? "#10B981" : colors.border }]}>
      <View style={[dr.icon, { backgroundColor: status === "uploaded" ? "#D1FAE5" : "#EEF2FF" }]}>
        <Feather name={status === "uploaded" ? "check-circle" : "file"} size={18} color={status === "uploaded" ? "#10B981" : "#4F46E5"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[dr.label, { color: colors.foreground }]}>{label}</Text>
        <Text style={[dr.sub, { color: status === "uploaded" ? "#10B981" : colors.mutedForeground }]}>
          {status === "uploaded" ? "Document uploaded successfully" : sub}
        </Text>
      </View>
      <TouchableOpacity style={[dr.btn, { backgroundColor: status === "uploaded" ? "#D1FAE5" : "#EEF2FF" }]} onPress={onUpload}>
        <Feather name={status === "uploaded" ? "check" : "upload"} size={14} color={status === "uploaded" ? "#10B981" : "#4F46E5"} />
        <Text style={[dr.btnText, { color: status === "uploaded" ? "#10B981" : "#4F46E5" }]}>
          {status === "uploaded" ? "Done" : "Upload"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const dr = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 12, marginBottom: 10 },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  btn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  btnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

// ─── Review Row ───────────────────────────────────────────────────────────────
function ReviewItem({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[rv.row, { borderBottomColor: colors.border }]}>
      <Text style={[rv.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rv.value, { color: colors.foreground }]}>{value || "—"}</Text>
    </View>
  );
}
function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[rv.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[rv.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}
const rv = StyleSheet.create({
  section: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 9, borderBottomWidth: 1 },
  label: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  value: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
});

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ loanType, bank }: { loanType: string; bank: string }) {
  const colors = useColors();
  const refNo = `APP${Date.now().toString().slice(-8)}`;
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 28 }}>
      <View style={[ss.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={ss.iconWrap}>
          <Feather name="check-circle" size={52} color="#10B981" />
        </View>
        <Text style={[ss.title, { color: colors.foreground }]}>Application Submitted!</Text>
        <Text style={[ss.sub, { color: colors.mutedForeground }]}>
          Your {loanType} application with{"\n"}<Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>{bank}</Text> has been submitted successfully.
        </Text>
        <View style={[ss.refBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
          <Text style={ss.refLabel}>Application Reference</Text>
          <Text style={ss.refNo}>{refNo}</Text>
          <Text style={ss.refSub}>You'll hear back within 24–48 hours</Text>
        </View>
        <View style={ss.steps}>
          {[
            { icon: "mail",          text: "Confirmation email sent" },
            { icon: "phone",         text: "Our team will contact you shortly" },
            { icon: "check-circle",  text: "Application under review" },
          ].map((r, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Feather name={r.icon as any} size={15} color="#4F46E5" />
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>{r.text}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[ss.btn, { backgroundColor: "#4F46E5" }]} onPress={() => router.replace("/(tabs)/")}>
          <Text style={ss.btnText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.replace("/(tabs)/my-loans")}>
          <Text style={{ color: "#4F46E5", fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>Track Your Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const ss = StyleSheet.create({
  card: { width: "100%", borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center" },
  iconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 8 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  refBox: { borderRadius: 12, borderWidth: 1, padding: 16, width: "100%", alignItems: "center", gap: 4, marginBottom: 20 },
  refLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  refNo: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#4F46E5" },
  refSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" },
  steps: { width: "100%", marginBottom: 20 },
  btn: { width: "100%", borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

// ─── CITIES ───────────────────────────────────────────────────────────────────
const CITIES = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "Indianapolis, IN", "San Francisco, CA", "Seattle, WA", "Denver, CO", "Boston, MA"];

const EMP_TYPES = ["Salaried", "Self-Employed", "Business Owner", "Retired", "Freelancer", "Government Employee"];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ApplyLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 0 : insets.top;

  const params = useLocalSearchParams<{
    bank: string; loanType: string; category: string;
    rate: string; maxAmount: string; processingFee: string;
  }>();

  const bank = params.bank || "Finstar Bank";
  const loanType = params.loanType || "Personal Loan";
  const category = params.category || "personal";
  const rate = params.rate || "8.49% p.a. onwards";
  const maxAmount = params.maxAmount || "$50,000";
  const processingFee = params.processingFee || "1.00% onwards";

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [s1, setS1] = useState<Step1Data>({
    fullName: "", dob: "", mobile: "", email: "", address: "",
    city: "", existingLoan: "no", vehicleType: "new",
    studentName: "", institution: "", course: "", businessName: "", purpose: "",
  });
  // Step 2
  const [s2, setS2] = useState<Step2Data>({
    empType: "salaried", company: "", income: "", experience: "", designation: "",
  });
  // Step 3
  const [s3, setS3] = useState<Step3Data>({
    amount: "25000", tenure: 36, propertyValue: "", downPayment: "",
    carMake: "", courseFee: "", businessRevenue: "",
  });
  // Step 4 — docs
  const [docs, setDocs] = useState<DocState>({
    id: "pending", address: "pending", income: "pending", bank: "pending", extra: "pending",
  });
  const [declaration, setDeclaration] = useState(false);

  // EMI calc
  const emi = useMemo(() => {
    const p = parseFloat(s3.amount) || 0;
    const rateNum = parseFloat(rate) || 10;
    const r = rateNum / 12 / 100;
    const n = s3.tenure;
    if (!p || !r || !n) return 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [s3.amount, s3.tenure, rate]);

  const tenureOptions = [6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360]
    .filter((t) => {
      if (category === "home") return t >= 24;
      if (category === "car") return t <= 84;
      if (category === "school") return t <= 120;
      if (category === "emergency") return t <= 36;
      if (category === "business") return t <= 120;
      return t <= 60;
    });

  const docRequirements: { key: keyof DocState; label: string; sub: string }[] = [
    { key: "id",      label: "Identity Proof",     sub: "Passport / Driver's License / State ID" },
    { key: "address", label: "Address Proof",       sub: "Utility Bill / Bank Statement / Lease Agreement" },
    { key: "income",  label: "Income Proof",        sub: "Pay Stubs / Tax Returns / Bank Statements" },
    { key: "bank",    label: "Bank Statement",      sub: "Last 3 months bank statement" },
    { key: "extra",   label: category === "home" ? "Property Documents" : category === "car" ? "Vehicle Quote / RC Book" : category === "school" ? "Admission Letter / Fee Structure" : "Supporting Documents",
      sub: "Any additional required documentation" },
  ];

  const validate = (): boolean => {
    if (step === 1) {
      if (!s1.fullName.trim()) { alert("Please enter your full name"); return false; }
      if (!s1.mobile.trim()) { alert("Please enter your mobile number"); return false; }
      if (!s1.email.trim()) { alert("Please enter your email address"); return false; }
      if (!s1.address.trim()) { alert("Please enter your current address"); return false; }
    }
    if (step === 2) {
      if (!s2.company.trim()) { alert("Please enter your employer / company name"); return false; }
      if (!s2.income.trim()) { alert("Please enter your monthly income"); return false; }
    }
    if (step === 3) {
      if (!s3.amount.trim() || parseFloat(s3.amount) < 1000) { alert("Please enter a valid loan amount (min $1,000)"); return false; }
    }
    if (step === 5 && !declaration) { alert("Please accept the declaration to proceed"); return false; }
    return true;
  };

  const next = () => { if (validate()) { if (step < 5) setStep(step + 1); else setSubmitted(true); } };
  const back = () => { if (step > 1) setStep(step - 1); else router.back(); };

  if (submitted) {
    return (
      <View style={[main.container, { backgroundColor: colors.background }]}>
        <View style={[main.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[main.headerTitle, { color: colors.foreground }]}>Application Submitted</Text>
        </View>
        <SuccessScreen loanType={loanType} bank={bank} />
      </View>
    );
  }

  return (
    <View style={[main.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[main.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[main.headerTitle, { color: colors.foreground }]}>Apply for {loanType}</Text>
          <Text style={[main.headerSub, { color: colors.mutedForeground }]}>It only takes a few minutes to get started</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={[main.stepWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <StepIndicator current={step} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 18, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          <SecurityBanner />

          {/* ── STEP 1: Personal Details ─────────────────────────────────── */}
          {step === 1 && (
            <>
              <SectionHeader title="Personal Details" sub="Please provide your basic information" />
              <Field label="Full Name" value={s1.fullName} onChange={(v) => setS1({ ...s1, fullName: v })} placeholder="John Doe" />
              <Row2>
                <View style={{ flex: 1 }}>
                  <Field label="Date of Birth" value={s1.dob} onChange={(v) => setS1({ ...s1, dob: v })} placeholder="15 Jan 1990" icon="calendar" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Mobile Number" value={s1.mobile} onChange={(v) => setS1({ ...s1, mobile: v })} placeholder="+1 (555) 123-4567" keyboardType="phone-pad" />
                </View>
              </Row2>
              <Field label="Email Address" value={s1.email} onChange={(v) => setS1({ ...s1, email: v })} placeholder="john.doe@email.com" keyboardType="email-address" />
              <Field label="Current Address" value={s1.address} onChange={(v) => setS1({ ...s1, address: v })} placeholder={"123 Main Street, Apt 4B,\nNew York, NY 10001, USA"} multiline />

              {(category === "home") && (
                <>
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                  <SectionHeader title="Property Location" sub="Where is your dream home located?" />
                  <SelectField label="City / State" value={s1.city} options={CITIES} onChange={(v) => setS1({ ...s1, city: v })} icon="map-pin" />
                  <RadioGroup label="Existing Home Loan?" value={s1.existingLoan}
                    options={[{ id: "no", label: "No" }, { id: "yes", label: "Yes" }]}
                    onChange={(v) => setS1({ ...s1, existingLoan: v as any })} />
                </>
              )}
              {(category === "car") && (
                <>
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                  <SectionHeader title="Vehicle Information" sub="Tell us about the vehicle you want to finance" />
                  <RadioGroup label="Vehicle Type" value={s1.vehicleType}
                    options={[{ id: "new", label: "New Vehicle" }, { id: "used", label: "Used Vehicle" }]}
                    onChange={(v) => setS1({ ...s1, vehicleType: v as any })} />
                </>
              )}
              {(category === "school") && (
                <>
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                  <SectionHeader title="Student Information" sub="Tell us about your education plans" />
                  <Field label="Student Name" value={s1.studentName} onChange={(v) => setS1({ ...s1, studentName: v })} placeholder="Enter student full name" />
                  <Field label="Institution Name" value={s1.institution} onChange={(v) => setS1({ ...s1, institution: v })} placeholder="University / School name" />
                  <Field label="Course / Program" value={s1.course} onChange={(v) => setS1({ ...s1, course: v })} placeholder="e.g. Bachelor of Science" />
                </>
              )}
              {(category === "business") && (
                <>
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                  <SectionHeader title="Business Information" sub="Tell us about your business" />
                  <Field label="Business Name" value={s1.businessName} onChange={(v) => setS1({ ...s1, businessName: v })} placeholder="Your business or company name" />
                  <SelectField label="Business Type" value={s1.purpose} options={["Sole Proprietorship", "Partnership", "LLC", "Corporation", "Non-Profit"]} onChange={(v) => setS1({ ...s1, purpose: v })} icon="briefcase" />
                </>
              )}
              {(category === "personal" || category === "emergency") && (
                <SelectField label="Purpose of Loan" value={s1.purpose}
                  options={category === "emergency" ? ["Medical Emergency", "Home Repair", "Travel", "Debt Consolidation", "Other Urgent Need"] : ["Debt Consolidation", "Home Renovation", "Wedding", "Travel", "Medical", "Education", "Other"]}
                  onChange={(v) => setS1({ ...s1, purpose: v })} icon="target" />
              )}
            </>
          )}

          {/* ── STEP 2: Employment Details ───────────────────────────────── */}
          {step === 2 && (
            <>
              <SectionHeader title="Employment Details" sub="Tell us about your employment and income" />
              <SelectField label="Employment Type" value={s2.empType === "salaried" ? "Salaried" : s2.empType === "self_employed" ? "Self-Employed" : s2.empType === "business_owner" ? "Business Owner" : "Retired"}
                options={EMP_TYPES} onChange={(v) => setS2({ ...s2, empType: v.toLowerCase().replace(/ /g, "_") as EmpType })} icon="briefcase" />
              {s2.empType !== "retired" && (
                <Field label="Employer / Company Name" value={s2.company} onChange={(v) => setS2({ ...s2, company: v })} placeholder="Company or business name" />
              )}
              <Row2>
                <View style={{ flex: 1 }}>
                  <Field label="Monthly Income ($)" value={s2.income} onChange={(v) => setS2({ ...s2, income: v })} placeholder="e.g. 5000" keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Work Experience (yrs)" value={s2.experience} onChange={(v) => setS2({ ...s2, experience: v })} placeholder="e.g. 5" keyboardType="numeric" />
                </View>
              </Row2>
              <Field label="Designation / Role" value={s2.designation} onChange={(v) => setS2({ ...s2, designation: v })} placeholder="e.g. Software Engineer" />

              {category === "school" && (
                <>
                  <View style={[main.divider, { backgroundColor: colors.border }]} />
                  <SectionHeader title="Co-Applicant (Optional)" sub="Parent or guardian co-applicant details" />
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 12 }}>
                    A co-applicant can improve your chances of approval and a better interest rate.
                  </Text>
                </>
              )}

              <View style={[main.infoCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Feather name="info" size={14} color="#4F46E5" />
                <Text style={[main.infoText, { color: "#4F46E5" }]}>
                  Income information is kept strictly confidential and used only for loan eligibility assessment.
                </Text>
              </View>
            </>
          )}

          {/* ── STEP 3: Loan Details ─────────────────────────────────────── */}
          {step === 3 && (
            <>
              <SectionHeader title="Loan Details" sub="Customize your loan amount and repayment plan" />

              {category === "home" && (
                <Row2>
                  <View style={{ flex: 1 }}>
                    <Field label="Property Value ($)" value={s3.propertyValue} onChange={(v) => setS3({ ...s3, propertyValue: v })} placeholder="e.g. 400000" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Down Payment ($)" value={s3.downPayment} onChange={(v) => setS3({ ...s3, downPayment: v })} placeholder="e.g. 80000" keyboardType="numeric" />
                  </View>
                </Row2>
              )}
              {category === "car" && (
                <Field label="Car Make / Model" value={s3.carMake} onChange={(v) => setS3({ ...s3, carMake: v })} placeholder="e.g. Toyota Camry 2024" />
              )}
              {category === "school" && (
                <Row2>
                  <View style={{ flex: 1 }}>
                    <Field label="Annual Course Fee ($)" value={s3.courseFee} onChange={(v) => setS3({ ...s3, courseFee: v })} placeholder="e.g. 20000" keyboardType="numeric" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Course Duration" value={s2.experience} onChange={(v) => setS2({ ...s2, experience: v })} placeholder="e.g. 4 years" />
                  </View>
                </Row2>
              )}
              {category === "business" && (
                <Field label="Monthly Business Revenue ($)" value={s3.businessRevenue} onChange={(v) => setS3({ ...s3, businessRevenue: v })} placeholder="e.g. 50000" keyboardType="numeric" />
              )}

              <Field label="Loan Amount ($)" value={s3.amount} onChange={(v) => setS3({ ...s3, amount: v })} placeholder="e.g. 25000" keyboardType="numeric"
                hint={`Max: ${maxAmount} • Min: $1,000`} />

              <View style={{ marginBottom: 14 }}>
                <Text style={[f.label, { color: colors.foreground }]}>Repayment Tenure</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {tenureOptions.map((t) => (
                    <TouchableOpacity key={t} style={[main.tenureChip, { borderColor: s3.tenure === t ? "#4F46E5" : colors.border, backgroundColor: s3.tenure === t ? "#4F46E5" : colors.card }]}
                      onPress={() => setS3({ ...s3, tenure: t })}>
                      <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: s3.tenure === t ? "#fff" : colors.foreground }}>
                        {t >= 12 ? `${t / 12}yr` : `${t}m`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* EMI Preview */}
              <View style={[main.emiBox, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }]}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280" }}>Estimated Monthly EMI</Text>
                <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: "#4F46E5", marginVertical: 4 }}>
                  ${isNaN(emi) || emi <= 0 ? "—" : emi.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: "#6B7280" }}>at {rate} for {s3.tenure} months</Text>
                <View style={[main.emiGrid]}>
                  {[
                    { label: "Loan Amount", value: `$${(parseFloat(s3.amount) || 0).toLocaleString()}` },
                    { label: "Interest Rate", value: rate },
                    { label: "Processing Fee", value: processingFee },
                    { label: "Total Interest", value: emi > 0 ? `$${(emi * s3.tenure - parseFloat(s3.amount)).toFixed(0)}` : "—" },
                  ].map((r, i) => (
                    <View key={i} style={main.emiGridItem}>
                      <Text style={{ fontSize: 10, fontFamily: "Inter_400Regular", color: "#6B7280" }}>{r.label}</Text>
                      <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1F2937", marginTop: 2 }}>{r.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* ── STEP 4: Documents ────────────────────────────────────────── */}
          {step === 4 && (
            <>
              <SectionHeader title="Upload Documents" sub="Please upload the required documents to proceed" />
              {docRequirements.map((d) => (
                <DocRow key={d.key} label={d.label} sub={d.sub} status={docs[d.key]}
                  onUpload={() => setDocs({ ...docs, [d.key]: docs[d.key] === "uploaded" ? "pending" : "uploaded" })} />
              ))}
              <View style={[main.infoCard, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A", marginTop: 8 }]}>
                <Feather name="alert-triangle" size={14} color="#D97706" />
                <Text style={[main.infoText, { color: "#92400E" }]}>
                  Ensure all documents are clear, legible, and not expired. Blurry or incomplete documents may delay processing.
                </Text>
              </View>
              <View style={[main.infoCard, { backgroundColor: "#EEF2FF", borderColor: "#C7D2FE", marginTop: 8 }]}>
                <Feather name="lock" size={14} color="#4F46E5" />
                <Text style={[main.infoText, { color: "#4F46E5" }]}>
                  All documents are encrypted and stored securely. We never share your data with third parties.
                </Text>
              </View>
            </>
          )}

          {/* ── STEP 5: Review & Submit ──────────────────────────────────── */}
          {step === 5 && (
            <>
              <SectionHeader title="Review & Submit" sub="Please review your application before submitting" />
              <ReviewSection title="Personal Details">
                <ReviewItem label="Full Name"      value={s1.fullName} />
                <ReviewItem label="Date of Birth"  value={s1.dob} />
                <ReviewItem label="Mobile Number"  value={s1.mobile} />
                <ReviewItem label="Email Address"  value={s1.email} />
                <ReviewItem label="Current Address" value={s1.address} />
                {category === "home" && <ReviewItem label="Property Location" value={s1.city} />}
                {category === "home" && <ReviewItem label="Existing Home Loan" value={s1.existingLoan === "yes" ? "Yes" : "No"} />}
                {category === "car"  && <ReviewItem label="Vehicle Type" value={s1.vehicleType === "new" ? "New Vehicle" : "Used Vehicle"} />}
                {category === "school" && <ReviewItem label="Student Name"  value={s1.studentName} />}
                {category === "school" && <ReviewItem label="Institution"   value={s1.institution} />}
                {category === "school" && <ReviewItem label="Course"        value={s1.course} />}
                {category === "business" && <ReviewItem label="Business Name" value={s1.businessName} />}
                {(category === "personal" || category === "emergency") && <ReviewItem label="Purpose" value={s1.purpose} />}
              </ReviewSection>
              <ReviewSection title="Employment Details">
                <ReviewItem label="Employment Type"  value={s2.empType.replace("_", " ")} />
                <ReviewItem label="Company / Employer" value={s2.company} />
                <ReviewItem label="Monthly Income"   value={s2.income ? `$${s2.income}` : ""} />
                <ReviewItem label="Work Experience"  value={s2.experience ? `${s2.experience} years` : ""} />
                <ReviewItem label="Designation"      value={s2.designation} />
              </ReviewSection>
              <ReviewSection title="Loan Details">
                <ReviewItem label="Lender"         value={bank} />
                <ReviewItem label="Loan Type"      value={loanType} />
                <ReviewItem label="Loan Amount"    value={s3.amount ? `$${parseFloat(s3.amount).toLocaleString()}` : ""} />
                <ReviewItem label="Tenure"         value={`${s3.tenure} months`} />
                <ReviewItem label="Interest Rate"  value={rate} />
                <ReviewItem label="Processing Fee" value={processingFee} />
                <ReviewItem label="Est. Monthly EMI" value={emi > 0 ? `$${emi.toFixed(2)}` : "—"} />
                {category === "home" && <ReviewItem label="Property Value" value={s3.propertyValue ? `$${s3.propertyValue}` : ""} />}
                {category === "car"  && <ReviewItem label="Car Make/Model" value={s3.carMake} />}
              </ReviewSection>
              <ReviewSection title="Documents">
                {docRequirements.map((d) => (
                  <ReviewItem key={d.key} label={d.label} value={docs[d.key] === "uploaded" ? "✓ Uploaded" : "Pending"} />
                ))}
              </ReviewSection>

              {/* Declaration */}
              <TouchableOpacity style={[main.declRow, { backgroundColor: colors.card, borderColor: declaration ? "#4F46E5" : colors.border }]}
                onPress={() => setDeclaration(!declaration)}>
                <View style={[main.checkbox, { borderColor: declaration ? "#4F46E5" : colors.border, backgroundColor: declaration ? "#4F46E5" : colors.card }]}>
                  {declaration && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={[main.declText, { color: colors.foreground }]}>
                  I confirm that all the information provided is accurate and complete. I authorize the lender to verify my details and process my application.
                </Text>
              </TouchableOpacity>
            </>
          )}

          <QuickAppBanner step={step} />

          {/* Continue / Submit Button */}
          <TouchableOpacity style={[main.continueBtn, { backgroundColor: "#4F46E5" }]} onPress={next}>
            <Text style={main.continueBtnText}>{step === 5 ? "Submit Application" : "Continue"}</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const main = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  stepWrap: { borderBottomWidth: 1, paddingTop: 12 },
  divider: { height: 1, marginVertical: 18 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  tenureChip: { borderWidth: 1.5, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center" },
  emiBox: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", marginBottom: 14 },
  emiGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12, width: "100%" },
  emiGridItem: { width: "50%", paddingVertical: 6, paddingHorizontal: 4 },
  declRow: { flexDirection: "row", gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 14, marginBottom: 14, alignItems: "flex-start" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  declText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 17 },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});

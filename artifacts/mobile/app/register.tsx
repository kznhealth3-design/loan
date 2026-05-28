import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BLUE = "#1E56E5";
const BLUE_MID = "#3B6FEF";
const isWeb = Platform.OS === "web";

type Step = 1 | 2 | 3 | 4;

const STEP_TITLES: Record<Step, { title: string; sub: string; label: string }> = {
  1: { title: "Create Your Account",   sub: "Let's get started with a few personal details.",  label: "Personal" },
  2: { title: "Secure Your Account",   sub: "Choose a strong password to protect your account.", label: "Security" },
  3: { title: "Tell Us About You",     sub: "Help us personalize your experience.",              label: "Preferences" },
  4: { title: "Review & Confirm",      sub: "Take a final look and accept our terms.",           label: "Confirm" },
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Brazil", "Mexico",
  "Japan", "South Korea", "Singapore", "UAE", "Saudi Arabia", "South Africa",
  "Nigeria", "Kenya", "New Zealand", "Ireland", "Sweden", "Norway", "Denmark",
];

const PHONE_CODES = [
  { code: "+1",   flag: "🇺🇸", label: "US" },
  { code: "+44",  flag: "🇬🇧", label: "UK" },
  { code: "+1",   flag: "🇨🇦", label: "CA" },
  { code: "+61",  flag: "🇦🇺", label: "AU" },
  { code: "+91",  flag: "🇮🇳", label: "IN" },
  { code: "+49",  flag: "🇩🇪", label: "DE" },
  { code: "+33",  flag: "🇫🇷", label: "FR" },
  { code: "+34",  flag: "🇪🇸", label: "ES" },
  { code: "+39",  flag: "🇮🇹", label: "IT" },
  { code: "+31",  flag: "🇳🇱", label: "NL" },
  { code: "+55",  flag: "🇧🇷", label: "BR" },
  { code: "+52",  flag: "🇲🇽", label: "MX" },
  { code: "+81",  flag: "🇯🇵", label: "JP" },
  { code: "+82",  flag: "🇰🇷", label: "KR" },
  { code: "+65",  flag: "🇸🇬", label: "SG" },
  { code: "+971", flag: "🇦🇪", label: "AE" },
  { code: "+966", flag: "🇸🇦", label: "SA" },
  { code: "+27",  flag: "🇿🇦", label: "ZA" },
  { code: "+234", flag: "🇳🇬", label: "NG" },
  { code: "+254", flag: "🇰🇪", label: "KE" },
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const EMPLOYMENT_STATUSES = [
  "Employed (Full-time)", "Employed (Part-time)", "Self-Employed",
  "Business Owner", "Freelancer / Contractor", "Student", "Unemployed", "Retired",
];

const REFERRAL_SOURCES = [
  { key: "facebook",   icon: "facebook",        color: "#1877F2", label: "Facebook" },
  { key: "instagram",  icon: "instagram",       color: "#E4405F", label: "Instagram" },
  { key: "google",     icon: "search",          color: "#4285F4", label: "Google Search" },
  { key: "youtube",    icon: "youtube",         color: "#FF0000", label: "YouTube" },
  { key: "friends",    icon: "users",           color: "#7C3AED", label: "Friends / Family" },
  { key: "online_ad",  icon: "monitor",         color: "#0EA5E9", label: "Online Advertisement" },
  { key: "other",      icon: "more-horizontal", color: "#6B7280", label: "Other" },
];

const LOAN_TYPES = [
  { key: "home",      emoji: "🏠", label: "Home Loan" },
  { key: "personal",  emoji: "💼", label: "Personal Loan" },
  { key: "car",       emoji: "🚗", label: "Car Loan" },
  { key: "business",  emoji: "🏪", label: "Business Loan" },
  { key: "education", emoji: "🎓", label: "Education Loan" },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function PickerModal({
  visible, title, items, onSelect, onClose,
}: {
  visible: boolean; title: string; items: string[];
  onSelect: (v: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <TouchableOpacity
              key={item} style={styles.sheetItem}
              onPress={() => { onSelect(item); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetItemText}>{item}</Text>
              <Feather name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function PhoneCodeModal({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean; selected: string;
  onSelect: (code: string, flag: string) => void; onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Select Country Code</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {PHONE_CODES.map((item, i) => (
            <TouchableOpacity
              key={i} style={[styles.sheetItem, selected === item.code && { backgroundColor: "#EEF4FF" }]}
              onPress={() => { onSelect(item.code, item.flag); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>{item.flag}</Text>
              <Text style={[styles.sheetItemText, { flex: 1 }]}>{item.label} ({item.code})</Text>
              {selected === item.code && <Feather name="check" size={16} color={BLUE} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

function DobModal({
  visible, day, month, year,
  onDayChange, onMonthChange, onYearChange,
  onClose,
}: {
  visible: boolean; day: string; month: string; year: string;
  onDayChange: (v: string) => void; onMonthChange: (v: string) => void; onYearChange: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Date of Birth</Text>
        <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dobLabel}>Day</Text>
            <TextInput
              style={styles.dobInput} value={day} onChangeText={onDayChange}
              keyboardType="number-pad" maxLength={2} placeholder="DD" placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={{ flex: 2 }}>
            <Text style={styles.dobLabel}>Month</Text>
            <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
              {MONTHS.map((m, i) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.monthItem, month === String(i + 1).padStart(2, "0") && { backgroundColor: "#EEF4FF" }]}
                  onPress={() => onMonthChange(String(i + 1).padStart(2, "0"))}
                >
                  <Text style={[styles.monthItemText, month === String(i + 1).padStart(2, "0") && { color: BLUE, fontFamily: "Inter_600SemiBold" }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ flex: 1.4 }}>
            <Text style={styles.dobLabel}>Year</Text>
            <TextInput
              style={styles.dobInput} value={year} onChangeText={onYearChange}
              keyboardType="number-pad" maxLength={4} placeholder="YYYY" placeholderTextColor="#94A3B8"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.dobConfirm} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.dobConfirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Terms & Conditions modal ──────────────────────────────────────────────────

function TermsModal({
  visible, kind, onClose,
}: {
  visible: boolean; kind: "terms" | "privacy"; onClose: () => void;
}) {
  const isTerms = kind === "terms";
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={[styles.sheet, { maxHeight: "85%" }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.termsHeader}>
          <View style={styles.termsHeaderIcon}>
            <Feather name={isTerms ? "file-text" : "shield"} size={18} color={BLUE} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.termsHeaderTitle}>{isTerms ? "Terms & Conditions" : "Privacy Policy"}</Text>
            <Text style={styles.termsHeaderSub}>Last updated: May 2026</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.termsClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {(isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS).map((sec, i) => (
            <View key={i} style={{ marginTop: i === 0 ? 8 : 16 }}>
              <Text style={styles.termsSection}>{i + 1}. {sec.heading}</Text>
              <Text style={styles.termsBody}>{sec.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.termsFooter}>
          <TouchableOpacity style={styles.termsAccept} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.termsAcceptText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const TERMS_SECTIONS = [
  { heading: "Acceptance of Terms",          body: "By creating an account with LoanGo, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services." },
  { heading: "Eligibility",                  body: "You must be at least 18 years old and a legal resident of a supported country to apply for a loan through LoanGo." },
  { heading: "Loan Approval",                body: "All loan applications are subject to credit verification and final approval. LoanGo reserves the right to approve or decline any application at its sole discretion." },
  { heading: "Interest Rates & Fees",        body: "Interest rates, processing fees and other charges will be disclosed before you accept any loan offer. You agree to repay the loan as per the agreed schedule." },
  { heading: "Repayment Obligation",         body: "You agree to repay all EMIs on or before the due dates. Late or missed payments may attract penalties and may be reported to credit bureaus." },
  { heading: "Account Security",             body: "You are responsible for keeping your account credentials secure. Notify us immediately of any unauthorized access." },
  { heading: "Changes to Terms",             body: "LoanGo may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the revised Terms." },
];

const PRIVACY_SECTIONS = [
  { heading: "Information We Collect",       body: "We collect personal information you provide such as name, email, phone, date of birth, employment details and identity documents needed for KYC." },
  { heading: "How We Use Your Data",         body: "Your information is used to verify your identity, process loan applications, manage your account and communicate important updates." },
  { heading: "Data Sharing",                 body: "We may share data with credit bureaus, payment processors and verified lending partners — strictly for the purpose of providing our services." },
  { heading: "Data Security",                body: "All data is encrypted in transit and at rest using bank-grade 256-bit encryption. Access is strictly controlled and audited." },
  { heading: "Your Rights",                  body: "You may request access, correction or deletion of your personal data at any time by contacting our support team." },
  { heading: "Cookies & Tracking",           body: "We use cookies and similar technologies to improve your experience, analyze usage and personalize content." },
  { heading: "Contact Us",                   body: "For any privacy concerns or questions, reach out to privacy@loango.example.com." },
];

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>
        {label}{optional && <Text style={styles.optional}> (Optional)</Text>}
      </Text>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Step indicator (4 steps, compact) ─────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepCounter}>Step {step} of 4</Text>
        <Text style={styles.stepHeaderLabel}>{STEP_TITLES[step].label}</Text>
      </View>
      <View style={styles.stepBar}>
        {[1, 2, 3, 4].map((i, idx) => {
          const active = step === i;
          const done   = step > i;
          return (
            <React.Fragment key={i}>
              {idx > 0 && <View style={[styles.stepConn, (done || (step === i && step > 1)) && { backgroundColor: BLUE }]} />}
              <View style={{ alignItems: "center" }}>
                {done ? (
                  <View style={[styles.stepDot, { backgroundColor: BLUE }]}>
                    <Feather name="check" size={11} color="#fff" />
                  </View>
                ) : active ? (
                  <LinearGradient colors={[BLUE, BLUE_MID]} style={styles.stepDot}>
                    <Text style={styles.stepDotNum}>{i}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.stepDot, styles.stepDotIdle]}>
                    <Text style={[styles.stepDotNum, { color: "#94A3B8" }]}>{i}</Text>
                  </View>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

// ─── Checkbox row ──────────────────────────────────────────────────────────────

function CheckRow({
  checked, onPress, label,
  icon, iconColor, emoji,
}: {
  checked: boolean; onPress: () => void; label: string;
  icon?: string; iconColor?: string; emoji?: string;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.checkIconWrap, icon && { backgroundColor: (iconColor || "#000") + "18" }]}>
        {emoji ? (
          <Text style={{ fontSize: 18 }}>{emoji}</Text>
        ) : (
          <Feather name={icon as any} size={16} color={iconColor} />
        )}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={[styles.checkbox, checked && { backgroundColor: BLUE, borderColor: BLUE }]}>
        {checked && <Feather name="check" size={11} color="#fff" />}
      </View>
    </TouchableOpacity>
  );
}

// ─── Review row ────────────────────────────────────────────────────────────────

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewIcon}>
        <Feather name={icon as any} size={14} color={BLUE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function Register() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState<Step>(1);

  // Step 1 — Personal
  const [firstName, setFirstName]     = useState("");
  const [middleName, setMiddleName]   = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState("");
  const [country, setCountry]         = useState("");
  const [phoneCode, setPhoneCode]     = useState("+1");
  const [phoneFlag, setPhoneFlag]     = useState("🇺🇸");
  const [phone, setPhone]             = useState("");
  const [dobDay, setDobDay]           = useState("");
  const [dobMonth, setDobMonth]       = useState("");
  const [dobYear, setDobYear]         = useState("");
  const [gender, setGender]           = useState("");

  // Step 2 — Security
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConf, setShowConf]       = useState(false);

  // Step 3 — Preferences
  const [referrals, setReferrals]     = useState<string[]>([]);
  const [loanPrefs, setLoanPrefs]     = useState<string[]>([]);
  const [employment, setEmployment]   = useState("");
  const [marketing, setMarketing]     = useState(true);

  // Step 4 — Consent
  const [acceptTerms, setAcceptTerms]     = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // Modal visibility
  const [countryOpen, setCountryOpen] = useState(false);
  const [genderOpen,  setGenderOpen]  = useState(false);
  const [dobOpen,     setDobOpen]     = useState(false);
  const [phoneOpen,   setPhoneOpen]   = useState(false);
  const [employOpen,  setEmployOpen]  = useState(false);
  const [termsModal,  setTermsModal]  = useState<null | "terms" | "privacy">(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const dobDisplay = dobDay && dobMonth && dobYear
    ? `${dobDay} / ${MONTHS[parseInt(dobMonth) - 1]} / ${dobYear}`
    : "";

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
  const phoneFull = phone ? `${phoneFlag} ${phoneCode} ${phone}` : "";
  const loanPrefsLabel = loanPrefs
    .map((k) => LOAN_TYPES.find((l) => l.key === k)?.label)
    .filter(Boolean)
    .join(", ");
  const referralLabel = referrals
    .map((k) => REFERRAL_SOURCES.find((r) => r.key === k)?.label)
    .filter(Boolean)
    .join(", ");

  const canSubmit = acceptTerms && acceptPrivacy;

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim())  e.lastName  = "Last name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Valid email address is required";
    if (!country)          e.country   = "Please select a country";
    if (!phone.trim())     e.phone     = "Phone number is required";
    if (!gender)           e.gender    = "Please select your gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (password.length < 8) e.password = "At least 8 characters with letters, numbers & symbols";
    if (password !== confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep = (s: Step) => {
    setStep(s);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 4) goToStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) goToStep((step - 1) as Step);
    else router.back();
  };

  const handleCreate = () => {
    if (!canSubmit) return;
    Alert.alert(
      "Account Created! 🎉",
      "Welcome to LoanGo! Your account has been created successfully.",
      [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }]
    );
  };

  const goSignIn = () => router.replace("/login");

  const topPad = insets.top + (isWeb ? 8 : 4);
  const botPad = insets.bottom + 16;

  const meta = STEP_TITLES[step];

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Fixed header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={20} color="#1E293B" />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={styles.headerSub}>Already have an account?</Text>
          <TouchableOpacity onPress={goSignIn} activeOpacity={0.7}>
            <Text style={styles.signInLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 110 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={{ marginTop: 18, marginBottom: 18 }}>
          <Text style={styles.title}>{meta.title}</Text>
          <Text style={styles.subtitle}>{meta.sub}</Text>
        </View>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* ── Step 1: Personal ── */}
        {step === 1 && (
          <>
            <Text style={styles.sectionHeader}>Personal Information</Text>

            <Field label="First Name" error={errors.firstName}>
              <View style={[styles.inputWrap, !!errors.firstName && styles.inputError]}>
                <Feather name="user" size={16} color="#94A3B8" />
                <TextInput style={styles.input} placeholder="Enter first name" placeholderTextColor="#94A3B8" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Middle Name" optional>
              <View style={styles.inputWrap}>
                <Feather name="user" size={16} color="#94A3B8" />
                <TextInput style={styles.input} placeholder="Enter middle name" placeholderTextColor="#94A3B8" value={middleName} onChangeText={setMiddleName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Last Name" error={errors.lastName}>
              <View style={[styles.inputWrap, !!errors.lastName && styles.inputError]}>
                <Feather name="user" size={16} color="#94A3B8" />
                <TextInput style={styles.input} placeholder="Enter last name" placeholderTextColor="#94A3B8" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
            </Field>

            <Field label="Email" error={errors.email}>
              <View style={[styles.inputWrap, !!errors.email && styles.inputError]}>
                <Feather name="mail" size={16} color="#94A3B8" />
                <TextInput style={styles.input} placeholder="Enter email address" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
            </Field>

            <Field label="Country" error={errors.country}>
              <TouchableOpacity style={[styles.inputWrap, !!errors.country && styles.inputError]} onPress={() => setCountryOpen(true)} activeOpacity={0.8}>
                <Feather name="globe" size={16} color="#94A3B8" />
                <Text style={[styles.input, !country && { color: "#94A3B8" }]} numberOfLines={1}>{country || "Select country"}</Text>
                <Feather name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="Phone Number" error={errors.phone}>
              <View style={[styles.inputWrap, !!errors.phone && styles.inputError, { gap: 0 }]}>
                <TouchableOpacity style={styles.phonePicker} onPress={() => setPhoneOpen(true)} activeOpacity={0.8}>
                  <Text style={{ fontSize: 18 }}>{phoneFlag}</Text>
                  <Text style={styles.phoneCode}>{phoneCode}</Text>
                  <Feather name="chevron-down" size={13} color="#64748B" />
                </TouchableOpacity>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={[styles.input, { flex: 1, marginLeft: 10 }]}
                  placeholder="Enter phone number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </Field>

            <Field label="Date of Birth">
              <TouchableOpacity style={styles.inputWrap} onPress={() => setDobOpen(true)} activeOpacity={0.8}>
                <Feather name="calendar" size={16} color="#94A3B8" />
                <Text style={[styles.input, !dobDisplay && { color: "#94A3B8" }]}>
                  {dobDisplay || "DD / MM / YYYY"}
                </Text>
                <Feather name="calendar" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>

            <Field label="Gender" error={errors.gender}>
              <TouchableOpacity style={[styles.inputWrap, !!errors.gender && styles.inputError]} onPress={() => setGenderOpen(true)} activeOpacity={0.8}>
                <Feather name="user-check" size={16} color="#94A3B8" />
                <Text style={[styles.input, !gender && { color: "#94A3B8" }]}>{gender || "Select gender"}</Text>
                <Feather name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </Field>
          </>
        )}

        {/* ── Step 2: Security ── */}
        {step === 2 && (
          <>
            <Text style={styles.sectionHeader}>Choose a Password</Text>

            <Field label="Password" error={errors.password}>
              <View style={[styles.inputWrap, !!errors.password && styles.inputError]}>
                <Feather name="lock" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.input} placeholder="Enter password" placeholderTextColor="#94A3B8"
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPwd} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPwd(!showPwd)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showPwd ? "eye" : "eye-off"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {!errors.password && (
                <Text style={styles.hintText}>At least 8 characters with a mix of letters, numbers & symbols</Text>
              )}
            </Field>

            <Field label="Confirm Password" error={errors.confirm}>
              <View style={[styles.inputWrap, !!errors.confirm && styles.inputError]}>
                <Feather name="lock" size={16} color="#94A3B8" />
                <TextInput
                  style={styles.input} placeholder="Confirm password" placeholderTextColor="#94A3B8"
                  value={confirm} onChangeText={setConfirm}
                  secureTextEntry={!showConf} autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConf(!showConf)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name={showConf ? "eye" : "eye-off"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </Field>

            {/* Password strength tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Make it strong</Text>
              <TipRow ok={password.length >= 8}                       text="At least 8 characters" />
              <TipRow ok={/[A-Z]/.test(password) && /[a-z]/.test(password)} text="Upper & lower case letters" />
              <TipRow ok={/\d/.test(password)}                        text="At least one number" />
              <TipRow ok={/[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/+=']/.test(password)} text="At least one special character" />
            </View>

            {/* Security note */}
            <View style={styles.securityNote}>
              <View style={[styles.secNoteIcon, { backgroundColor: BLUE + "15" }]}>
                <Feather name="shield" size={18} color={BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.secNoteTitle}>Your security is important to us</Text>
                <Text style={styles.secNoteSub}>We use bank-level encryption to keep your information safe and secure.</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Step 3: Preferences ── */}
        {step === 3 && (
          <>
            <Text style={styles.sectionHeader}>Where did you hear about us?</Text>
            <Text style={styles.selectAll}>Select all that apply</Text>
            <View style={styles.checkCard}>
              {REFERRAL_SOURCES.map((src, i) => (
                <View key={src.key}>
                  <CheckRow
                    checked={referrals.includes(src.key)}
                    onPress={() => toggleArr(referrals, src.key, setReferrals)}
                    label={src.label}
                    icon={src.icon}
                    iconColor={src.color}
                  />
                  {i < REFERRAL_SOURCES.length - 1 && <View style={styles.checkDivider} />}
                </View>
              ))}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>What are you mainly looking for?</Text>
            <Text style={styles.selectAll}>Select all that apply</Text>
            <View style={styles.checkCard}>
              {LOAN_TYPES.map((lt, i) => (
                <View key={lt.key}>
                  <CheckRow
                    checked={loanPrefs.includes(lt.key)}
                    onPress={() => toggleArr(loanPrefs, lt.key, setLoanPrefs)}
                    label={lt.label}
                    emoji={lt.emoji}
                  />
                  {i < LOAN_TYPES.length - 1 && <View style={styles.checkDivider} />}
                </View>
              ))}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Your Current Employment Status</Text>
            <TouchableOpacity style={styles.inputWrap} onPress={() => setEmployOpen(true)} activeOpacity={0.8}>
              <Feather name="briefcase" size={16} color="#94A3B8" />
              <Text style={[styles.input, !employment && { color: "#94A3B8" }, { flex: 1 }]}>{employment || "Select employment status"}</Text>
              <Feather name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Stay updated with offers & tips</Text>
                <Text style={styles.toggleSub}>Receive updates on loans, offers and helpful tips via email and SMS.</Text>
              </View>
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ true: BLUE, false: "#E2E8F0" }}
                thumbColor="#fff"
              />
            </View>
          </>
        )}

        {/* ── Step 4: Review & Confirm ── */}
        {step === 4 && (
          <>
            <Text style={styles.sectionHeader}>Review Your Details</Text>
            <View style={styles.reviewCard}>
              <ReviewRow icon="user"        label="Full Name"      value={fullName} />
              <ReviewRow icon="mail"        label="Email"          value={email} />
              <ReviewRow icon="phone"       label="Phone Number"   value={phoneFull} />
              <ReviewRow icon="globe"       label="Country"        value={country} />
              <ReviewRow icon="calendar"    label="Date of Birth"  value={dobDisplay} />
              <ReviewRow icon="user-check"  label="Gender"         value={gender} />
              <ReviewRow icon="briefcase"   label="Employment"     value={employment} />
              <ReviewRow icon="layers"      label="Loan Interests" value={loanPrefsLabel} />
              <ReviewRow icon="info"        label="Heard via"      value={referralLabel} />
            </View>
            <TouchableOpacity style={styles.editLink} onPress={() => goToStep(1)} activeOpacity={0.7}>
              <Feather name="edit-2" size={13} color={BLUE} />
              <Text style={styles.editLinkText}>Edit details</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 22 }]}>Agreements</Text>

            <TouchableOpacity
              style={[styles.consentRow, acceptTerms && styles.consentRowOn]}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.bigCheck, acceptTerms && styles.bigCheckOn]}>
                {acceptTerms && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.consentText}>
                I have read and agree to the{" "}
                <Text style={styles.consentLink} onPress={() => setTermsModal("terms")}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.consentRow, acceptPrivacy && styles.consentRowOn]}
              onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              activeOpacity={0.8}
            >
              <View style={[styles.bigCheck, acceptPrivacy && styles.bigCheckOn]}>
                {acceptPrivacy && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.consentText}>
                I accept the{" "}
                <Text style={styles.consentLink} onPress={() => setTermsModal("privacy")}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {!canSubmit && (
              <View style={styles.warnRow}>
                <Feather name="alert-circle" size={14} color="#D97706" />
                <Text style={styles.warnText}>Please accept both agreements to create your account.</Text>
              </View>
            )}

            <View style={[styles.securityNote, { marginTop: 16 }]}>
              <View style={[styles.secNoteIcon, { backgroundColor: "#DCFCE7" }]}>
                <Feather name="check-circle" size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.secNoteTitle}>You're all set!</Text>
                <Text style={styles.secNoteSub}>Tap "Create Account" below to finish signing up and start exploring LoanGo.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={[styles.bottom, { paddingBottom: botPad }]}>
        {step < 4 ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleNext} activeOpacity={0.88}>
            <LinearGradient colors={[BLUE, BLUE_MID]} style={styles.primaryGrad}>
              <Text style={styles.primaryText}>Continue</Text>
              <Feather name="arrow-right" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={canSubmit ? 0.88 : 1}
            disabled={!canSubmit}
          >
            <LinearGradient
              colors={canSubmit ? [BLUE, BLUE_MID] : ["#CBD5E1", "#94A3B8"]}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>Create Account</Text>
              <Feather name="check" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {step > 1 && (
          <TouchableOpacity onPress={handleBack} style={{ marginTop: 10, alignSelf: "center" }} activeOpacity={0.7}>
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
        )}

        {/* Page dots */}
        <View style={styles.dots}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
          ))}
        </View>
      </View>

      {/* Modals */}
      <PickerModal visible={countryOpen} title="Select Country" items={COUNTRIES}
        onSelect={setCountry} onClose={() => setCountryOpen(false)} />
      <PickerModal visible={genderOpen} title="Select Gender" items={GENDERS}
        onSelect={setGender} onClose={() => setGenderOpen(false)} />
      <PickerModal visible={employOpen} title="Employment Status" items={EMPLOYMENT_STATUSES}
        onSelect={setEmployment} onClose={() => setEmployOpen(false)} />
      <PhoneCodeModal visible={phoneOpen} selected={phoneCode}
        onSelect={(code, flag) => { setPhoneCode(code); setPhoneFlag(flag); }}
        onClose={() => setPhoneOpen(false)} />
      <DobModal
        visible={dobOpen} day={dobDay} month={dobMonth} year={dobYear}
        onDayChange={setDobDay} onMonthChange={setDobMonth} onYearChange={setDobYear}
        onClose={() => setDobOpen(false)}
      />
      <TermsModal
        visible={!!termsModal}
        kind={termsModal || "terms"}
        onClose={() => setTermsModal(null)}
      />
    </View>
  );
}

function TipRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.tipRow}>
      <View style={[styles.tipDot, ok && { backgroundColor: "#16A34A" }]}>
        {ok && <Feather name="check" size={9} color="#fff" />}
      </View>
      <Text style={[styles.tipText, ok && { color: "#16A34A" }]}>{text}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  backBtn: { padding: 4 },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },
  signInLink: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: BLUE },

  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#0F172A", lineHeight: 32, letterSpacing: -0.4, marginBottom: 6 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 19 },

  // Step indicator
  stepHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  stepCounter: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: BLUE, letterSpacing: 0.4, textTransform: "uppercase" },
  stepHeaderLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  stepBar: { flexDirection: "row", alignItems: "center" },
  stepConn: { flex: 1, height: 3, backgroundColor: "#E2E8F0", borderRadius: 2, marginHorizontal: 4 },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepDotIdle: { backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0" },
  stepDotNum: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12 },

  sectionHeader: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1E293B", marginBottom: 12 },
  selectAll: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: -8, marginBottom: 10 },

  label: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#374151", marginBottom: 6 },
  optional: { fontFamily: "Inter_400Regular", color: "#94A3B8" },
  errorText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#EF4444", marginTop: 4 },
  hintText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", marginTop: 4 },

  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
    overflow: "hidden",
  },
  inputError: { borderColor: "#FCA5A5", backgroundColor: "#FFF5F5" },
  input: {
    flex: 1, minWidth: 0, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B",
    paddingVertical: 0,
    ...(isWeb ? { outlineStyle: "none" } as any : {}),
  },

  phonePicker: { flexDirection: "row", alignItems: "center", gap: 5 },
  phoneCode: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
  phoneDivider: { width: 1, height: 22, backgroundColor: "#E2E8F0", marginHorizontal: 4 },

  // Tips
  tipsCard: {
    backgroundColor: "#F8FAFC", borderRadius: 12, padding: 14, gap: 8,
    borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 6,
  },
  tipsTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 4 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B" },

  // Security note
  securityNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "#F0F5FF", borderRadius: 12, padding: 14, marginTop: 10,
  },
  secNoteIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secNoteTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 3 },
  secNoteSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 17 },

  // Check rows
  checkCard: { borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0", backgroundColor: "#fff", overflow: "hidden" },
  checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
  checkIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  checkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B" },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  checkDivider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 62 },

  // Toggle
  toggleRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 14, marginTop: 14,
  },
  toggleTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginBottom: 3 },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 17 },

  // Review card
  reviewCard: {
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    paddingVertical: 4,
  },
  reviewRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, paddingHorizontal: 14 },
  reviewIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  reviewLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8", letterSpacing: 0.3, textTransform: "uppercase" },
  reviewValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B", marginTop: 2 },
  editLink: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", gap: 6, marginTop: 8, paddingVertical: 6, paddingHorizontal: 4 },
  editLinkText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLUE },

  // Consent rows (Terms / Privacy)
  consentRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#F8FAFC", borderRadius: 14, borderWidth: 1.5, borderColor: "#E2E8F0",
    padding: 14, marginBottom: 10,
  },
  consentRowOn: { backgroundColor: "#F0F5FF", borderColor: "#C7DEFF" },
  bigCheck: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: "#CBD5E1",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  bigCheckOn: { backgroundColor: BLUE, borderColor: BLUE },
  consentText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#374151", lineHeight: 18 },
  consentLink: { color: BLUE, fontFamily: "Inter_600SemiBold", textDecorationLine: "underline" },

  warnRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF3C7", borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  warnText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium", color: "#92400E" },

  // Bottom bar
  bottom: {
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#F1F5F9",
  },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryBtnDisabled: { opacity: 0.9 },
  primaryGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  primaryText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  backLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLUE, textAlign: "center" },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: BLUE },

  // Modals
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40, maxHeight: "75%",
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1E293B", textAlign: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  sheetItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  sheetItemText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#1E293B" },

  // Terms modal
  termsHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  termsHeaderIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  termsHeaderTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A" },
  termsHeaderSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#94A3B8", marginTop: 1 },
  termsClose: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  termsSection: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#0F172A", marginBottom: 4 },
  termsBody: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#475569", lineHeight: 19 },
  termsFooter: { paddingHorizontal: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#F1F5F9" },
  termsAccept: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  termsAcceptText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  // DOB modal
  dobLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B", marginBottom: 6 },
  dobInput: {
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 10, padding: 10,
    fontSize: 16, fontFamily: "Inter_500Medium", color: "#1E293B", textAlign: "center",
    backgroundColor: "#F8FAFC",
    ...(isWeb ? { outlineStyle: "none" } as any : {}),
  },
  monthItem: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6 },
  monthItemText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#1E293B" },
  dobConfirm: {
    marginHorizontal: 16, marginTop: 20, borderRadius: 14, backgroundColor: BLUE, paddingVertical: 14, alignItems: "center",
  },
  dobConfirmText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});

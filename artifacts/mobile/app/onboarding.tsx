import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: WIN_W } = Dimensions.get("window");
const SLIDE_W = Math.min(WIN_W, 430);

const BLUE = "#1E56E5";
const BLUE_MID = "#3B6FEF";
const BLUE_DARK = "#1A3FB8";
const INK = "#0F172A";
const MUTED = "#64748B";
const BG = "#FAFBFF";

// ─── Reusable bits ─────────────────────────────────────────────────────────────

function Logo() {
  return (
    <View style={s.logoRow}>
      <LinearGradient
        colors={[BLUE, BLUE_MID]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.logoMark}
      >
        <Feather name="dollar-sign" size={18} color="#fff" />
      </LinearGradient>
      <Text style={s.logoText}>
        Loan<Text style={{ color: BLUE }}>Go</Text>
      </Text>
    </View>
  );
}

function FeaturePill({
  icon,
  title,
  sub,
  bg = "#EEF4FF",
  color = BLUE,
}: {
  icon: string;
  title: string;
  sub: string;
  bg?: string;
  color?: string;
}) {
  return (
    <View style={s.pill}>
      <View style={[s.pillIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.pillTitle}>{title}</Text>
        <Text style={s.pillSub}>{sub}</Text>
      </View>
    </View>
  );
}

// ─── Slide 1 hero: Floating cards around a gradient orb ───────────────────────

function WelcomeHero() {
  return (
    <LinearGradient colors={["#EEF4FF", "#F5F8FF", BG]} style={s.heroBg}>
      {/* Soft background circles */}
      <View style={[s.softCircle, { width: 220, height: 220, top: -60, right: -70, backgroundColor: "#DBEAFE" }]} />
      <View style={[s.softCircle, { width: 140, height: 140, bottom: -40, left: -50, backgroundColor: "#E0E7FF" }]} />

      {/* Center gradient orb */}
      <View style={s.heroCenter}>
        <LinearGradient
          colors={[BLUE, BLUE_MID]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.orb}
        >
          <Feather name="dollar-sign" size={56} color="#fff" />
        </LinearGradient>

        {/* Floating mini cards */}
        <View style={[s.miniCard, { top: 14, left: 14 }]}>
          <View style={[s.miniIcon, { backgroundColor: "#DCFCE7" }]}>
            <Feather name="check" size={12} color="#16A34A" />
          </View>
          <View>
            <Text style={s.miniTitle}>Approved</Text>
            <Text style={s.miniSub}>2 min ago</Text>
          </View>
        </View>

        <View style={[s.miniCard, { bottom: 22, right: 10 }]}>
          <View style={[s.miniIcon, { backgroundColor: "#FEF3C7" }]}>
            <Feather name="trending-up" size={12} color="#D97706" />
          </View>
          <View>
            <Text style={s.miniTitle}>$5,000</Text>
            <Text style={s.miniSub}>5.99% APR</Text>
          </View>
        </View>

        <View style={[s.miniCard, { top: 90, right: -4 }]}>
          <View style={[s.miniIcon, { backgroundColor: "#EEF4FF" }]}>
            <Feather name="shield" size={12} color={BLUE} />
          </View>
          <View>
            <Text style={s.miniTitle}>Secured</Text>
            <Text style={s.miniSub}>Bank-grade</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Slide 2 hero: Loan type grid ──────────────────────────────────────────────

const LOAN_TILES = [
  { icon: "home",          label: "Home",      color: "#1E56E5", bg: "#EEF4FF" },
  { icon: "truck",         label: "Car",       color: "#0EA5E9", bg: "#E0F2FE" },
  { icon: "book-open",     label: "Education", color: "#8B5CF6", bg: "#F3E8FF" },
  { icon: "briefcase",     label: "Personal",  color: "#F59E0B", bg: "#FEF3C7" },
  { icon: "shopping-bag",  label: "Business",  color: "#10B981", bg: "#D1FAE5" },
  { icon: "smartphone",    label: "Gadget",    color: "#EC4899", bg: "#FCE7F3" },
] as const;

function LoanTile({ icon, label, color, bg }: typeof LOAN_TILES[number]) {
  return (
    <View style={s.tile}>
      <View style={[s.tileIcon, { backgroundColor: bg }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <Text style={s.tileLabel}>{label}</Text>
    </View>
  );
}

function LoansHero() {
  return (
    <LinearGradient colors={["#F5F8FF", BG]} style={[s.heroBg, { padding: 20, justifyContent: "center" }]}>
      <View style={s.tileGrid}>
        {LOAN_TILES.map((t) => <LoanTile key={t.label} {...t} />)}
      </View>
    </LinearGradient>
  );
}

// ─── Slide 3 hero: Step phone mockup ───────────────────────────────────────────

function StepsHero() {
  return (
    <LinearGradient colors={["#EEF4FF", "#F5F8FF", BG]} style={[s.heroBg, { alignItems: "center", justifyContent: "center" }]}>
      <View style={[s.softCircle, { width: 180, height: 180, top: 10, right: -50, backgroundColor: "#DBEAFE" }]} />
      <View style={[s.softCircle, { width: 120, height: 120, bottom: 10, left: -30, backgroundColor: "#E0E7FF" }]} />

      <View style={s.phone}>
        <View style={s.phoneNotch} />
        <View style={s.phoneScreen}>
          <View style={[s.phoneBar, { width: "60%" }]} />
          <View style={[s.phoneBar, { width: "40%", marginTop: 4 }]} />

          <LinearGradient colors={["#DCFCE7", "#BBF7D0"]} style={s.phoneCard}>
            <View style={s.phoneCheck}>
              <Feather name="check" size={18} color="#fff" />
            </View>
            <Text style={s.phoneCardTitle}>Loan Approved!</Text>
            <Text style={s.phoneAmount}>$5,000</Text>
          </LinearGradient>

          <View style={[s.phoneBar, { width: "80%", marginTop: 6 }]} />
          <View style={[s.phoneBar, { width: "55%", marginTop: 4 }]} />
        </View>
      </View>

      {/* Floating coins */}
      <View style={[s.floatCoin, { top: 40, left: 30 }]}>
        <Feather name="dollar-sign" size={14} color="#fff" />
      </View>
      <View style={[s.floatCoin, { top: 80, right: 24, backgroundColor: "#F59E0B" }]}>
        <Feather name="zap" size={14} color="#fff" />
      </View>
      <View style={[s.floatCoin, { bottom: 38, left: 22, backgroundColor: "#22C55E" }]}>
        <Feather name="check" size={14} color="#fff" />
      </View>
    </LinearGradient>
  );
}

function StepItem({ num, icon, title, sub, last }: { num: number; icon: string; title: string; sub: string; last?: boolean }) {
  return (
    <View style={s.stepRow}>
      <View style={{ alignItems: "center" }}>
        <LinearGradient colors={[BLUE, BLUE_MID]} style={s.stepCircle}>
          <Text style={s.stepNum}>{num}</Text>
        </LinearGradient>
        {!last && <View style={s.stepLine} />}
      </View>
      <View style={s.stepContent}>
        <View style={s.stepIconBox}>
          <Feather name={icon as any} size={16} color={BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.stepTitle}>{title}</Text>
          <Text style={s.stepSub}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Slide 4 hero: Trust stats ─────────────────────────────────────────────────

function TrustHero() {
  return (
    <LinearGradient colors={["#EEF4FF", "#F5F8FF", BG]} style={[s.heroBg, { padding: 20, justifyContent: "center" }]}>
      <View style={[s.softCircle, { width: 200, height: 200, top: -40, left: -60, backgroundColor: "#DBEAFE" }]} />

      <View style={s.statRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>$2B+</Text>
          <Text style={s.statLabel}>Disbursed</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>1M+</Text>
          <Text style={s.statLabel}>Happy Users</Text>
        </View>
      </View>
      <View style={[s.statRow, { marginTop: 12 }]}>
        <View style={[s.statCard, { backgroundColor: BLUE }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="star" size={16} color="#FCD34D" />
            <Text style={[s.statValue, { color: "#fff" }]}>4.8</Text>
          </View>
          <Text style={[s.statLabel, { color: "#DBEAFE" }]}>App Rating</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>2 min</Text>
          <Text style={s.statLabel}>Approval</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);

  const goTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * SLIDE_W, animated: true });
    setCurrent(idx);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDE_W);
    if (idx >= 0 && idx < 4) setCurrent(idx);
  };

  const goRegister = () => router.push("/register");
  const goLogin = () => router.push("/login");
  const isLast = current === 3;

  const SLIDES = [
    {
      key: "s1",
      hero: <WelcomeHero />,
      heroFlex: 1.4,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={s.title}>Smart Loans,{"\n"}Simplified.</Text>
          <Text style={s.subtitle}>
            Your trusted partner for fast approvals and flexible repayment — all in one app.
          </Text>
          <View style={{ gap: 12, marginTop: 18 }}>
            <FeaturePill icon="zap" title="Instant Approval" sub="Get a decision in under 2 minutes." />
            <FeaturePill icon="shield" title="Bank-Level Security" sub="256-bit encryption keeps you safe." bg="#DCFCE7" color="#16A34A" />
            <FeaturePill icon="percent" title="Low Interest Rates" sub="Starting from just 5.99% APR." bg="#FEF3C7" color="#D97706" />
          </View>
        </View>
      ),
    },
    {
      key: "s2",
      hero: <LoansHero />,
      heroFlex: 1.4,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={s.title}>Loans for{"\n"}Every Goal.</Text>
          <Text style={s.subtitle}>
            From dream homes to daily expenses — we have a loan that fits your life.
          </Text>
          <View style={{ gap: 12, marginTop: 18 }}>
            <FeaturePill icon="layers" title="6 Loan Categories" sub="Home, car, education, personal & more." />
            <FeaturePill icon="sliders" title="Flexible Tenure" sub="Repay in 3 months to 30 years." bg="#F3E8FF" color="#8B5CF6" />
          </View>
        </View>
      ),
    },
    {
      key: "s3",
      hero: <StepsHero />,
      heroFlex: 1.1,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={s.title}>Approved in{"\n"}3 Easy Steps.</Text>
          <Text style={s.subtitle}>A hassle-free process designed just for you.</Text>
          <View style={{ marginTop: 16 }}>
            <StepItem num={1} icon="edit-3" title="Apply Online" sub="Fill a short form in just a few minutes." />
            <StepItem num={2} icon="check-circle" title="Get Approved" sub="Smart review and instant decision." />
            <StepItem num={3} icon="dollar-sign" title="Receive Funds" sub="Money straight to your bank account." last />
          </View>
        </View>
      ),
    },
    {
      key: "s4",
      hero: <TrustHero />,
      heroFlex: 1.2,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={s.title}>Join Millions of{"\n"}Happy Borrowers.</Text>
          <Text style={s.subtitle}>
            Trusted by people across the globe to fund their biggest moments.
          </Text>
          <View style={{ gap: 12, marginTop: 18 }}>
            <FeaturePill icon="headphones" title="24/7 Support" sub="Real humans, always here to help." />
            <FeaturePill icon="bell" title="Real-time Updates" sub="Track your application anytime." bg="#DCFCE7" color="#16A34A" />
          </View>
        </View>
      ),
    },
  ] as const;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Top bar with logo */}
      <View style={s.topBar}>
        <Logo />
        {!isLast && (
          <TouchableOpacity onPress={goRegister} activeOpacity={0.7} style={s.skipBtn}>
            <Text style={s.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: SLIDE_W * 4 }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.key} style={{ width: SLIDE_W, flex: 1 }}>
            <View style={{ flex: slide.heroFlex }}>{slide.hero}</View>
            <View style={{ flex: 1.6 }}>{slide.content}</View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[s.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <View style={s.dots}>
          {[0, 1, 2, 3].map((i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.8}>
              <View style={[s.dot, i === current && s.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>

        {!isLast ? (
          <View style={s.navRow}>
            <TouchableOpacity onPress={goLogin} style={s.ghostBtn} activeOpacity={0.75}>
              <Text style={s.ghostText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goTo(current + 1)} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient colors={[BLUE, BLUE_MID]} style={s.nextBtn}>
                <Text style={s.nextText}>Continue</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <TouchableOpacity onPress={goRegister} activeOpacity={0.85}>
              <LinearGradient colors={[BLUE, BLUE_MID]} style={s.ctaBtn}>
                <Text style={s.ctaText}>Get Started</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            <View style={s.signInRow}>
              <Text style={s.signInLabel}>Already have an account?</Text>
              <TouchableOpacity onPress={goLogin} activeOpacity={0.7}>
                <Text style={s.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center",
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  logoText: { fontSize: 18, fontFamily: "Inter_700Bold", color: INK, letterSpacing: -0.3 },
  skipBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#F1F5F9" },
  skipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: MUTED },

  // Hero
  heroBg: { flex: 1, overflow: "hidden", position: "relative" },
  softCircle: { position: "absolute", borderRadius: 999, opacity: 0.55 },
  heroCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  orb: {
    width: 130, height: 130, borderRadius: 65, alignItems: "center", justifyContent: "center",
    shadowColor: BLUE, shadowOpacity: 0.4, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12,
  },
  miniCard: {
    position: "absolute", flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 8, paddingHorizontal: 10,
    shadowColor: "#0F172A", shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  miniIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  miniTitle: { fontSize: 11, fontFamily: "Inter_700Bold", color: INK },
  miniSub: { fontSize: 9, fontFamily: "Inter_400Regular", color: MUTED, marginTop: 1 },

  // Loan tiles (slide 2)
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  tile: {
    width: 96, alignItems: "center", paddingVertical: 14, gap: 8,
    backgroundColor: "#fff", borderRadius: 16,
    shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  tileIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tileLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: INK },

  // Phone (slide 3)
  phone: {
    width: 150, height: 230, borderRadius: 26,
    backgroundColor: "#1E293B", padding: 6,
    shadowColor: BLUE, shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  phoneNotch: { width: 50, height: 6, borderRadius: 3, backgroundColor: "#0F172A", alignSelf: "center", marginBottom: 6 },
  phoneScreen: { flex: 1, backgroundColor: "#fff", borderRadius: 20, padding: 14, alignItems: "stretch" },
  phoneBar: { height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" },
  phoneCard: {
    marginTop: 14, marginBottom: 6, borderRadius: 14, padding: 12, alignItems: "center",
    borderWidth: 1, borderColor: "#86EFAC",
  },
  phoneCheck: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#16A34A",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  phoneCardTitle: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#15803D" },
  phoneAmount: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0F172A", marginTop: 1 },
  floatCoin: {
    position: "absolute", width: 32, height: 32, borderRadius: 16, backgroundColor: BLUE,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#0F172A", shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },

  // Stats (slide 4)
  statRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 4,
    shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: INK, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: MUTED },

  // Steps
  stepRow: { flexDirection: "row" },
  stepCircle: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  stepLine: { width: 2, flex: 1, backgroundColor: "#DBEAFE", alignSelf: "center", marginVertical: 2, minHeight: 20 },
  stepContent: { flex: 1, flexDirection: "row", gap: 10, marginLeft: 12, paddingBottom: 16 },
  stepIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#EEF4FF", alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: INK },
  stepSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED, marginTop: 2, lineHeight: 17 },

  // Text
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: INK, lineHeight: 34, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: MUTED, lineHeight: 20 },

  // Feature pills
  pill: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pillIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pillTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: INK },
  pillSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED, marginTop: 2, lineHeight: 17 },

  // Bottom
  bottom: {
    paddingHorizontal: 20, paddingTop: 12, gap: 14,
    backgroundColor: BG, borderTopWidth: 1, borderTopColor: "#EEF2FF",
  },
  dots: { flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: BLUE },
  navRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  ghostBtn: { paddingVertical: 13, paddingHorizontal: 18, borderRadius: 14, backgroundColor: "#EEF4FF" },
  ghostText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: BLUE },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
    shadowColor: BLUE, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  nextText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 16, borderRadius: 14,
    shadowColor: BLUE, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 6,
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  signInRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 },
  signInLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED },
  signInLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLUE },
});

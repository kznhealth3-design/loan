import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
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
const BLUE_SOFT = "#EEF4FF";
const BLUE_LIGHT = "#DBEAFE";

// ─── Styles (defined first to avoid TDZ) ──────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFBFF" },
  illuBg: { flex: 1, overflow: "hidden" as const },

  // House parts
  cloud: { position: "absolute" as const, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 30 },
  roof: {
    width: 0, height: 0,
    borderLeftWidth: 85, borderRightWidth: 85, borderBottomWidth: 55,
    borderStyle: "solid" as const,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderBottomColor: "#1E3A8A",
    alignSelf: "center" as const,
    marginBottom: -2, zIndex: 2,
  },
  roofShadow: {
    width: 0, height: 0,
    borderLeftWidth: 88, borderRightWidth: 88, borderBottomWidth: 58,
    borderStyle: "solid" as const,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    borderBottomColor: "#13284F",
    alignSelf: "center" as const,
    position: "absolute" as const, top: 1, zIndex: 1,
  },
  houseBody: {
    height: 90, backgroundColor: "#2A52BE", borderRadius: 2,
    flexDirection: "row" as const, alignItems: "flex-end" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 12, paddingBottom: 0, position: "relative" as const,
  },
  garage: { width: 50, height: 50, backgroundColor: "#1E3A8A", borderRadius: 3, padding: 4 },
  garageInner: { flex: 1, backgroundColor: "#0A1F5C", borderRadius: 2 },
  door: {
    width: 30, height: 46, backgroundColor: "#1a3e8f", borderRadius: 4,
    alignSelf: "flex-end" as const, position: "relative" as const,
  },
  doorKnob: {
    position: "absolute" as const, right: 4, top: "50%" as any,
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#FFD700",
  },
  window: {
    position: "absolute" as const, top: 18, left: 12,
    width: 26, height: 22, backgroundColor: "#7EC8E3",
    borderRadius: 2, borderWidth: 2, borderColor: "#1E3A8A",
  },
  windowCross: {
    position: "absolute" as const, top: 0, bottom: 0, left: "50%" as any,
    width: 2, backgroundColor: "#1E3A8A", marginLeft: -1,
  },
  windowCrossH: {
    position: "absolute" as const, left: 0, right: 0, top: "50%" as any,
    height: 2, backgroundColor: "#1E3A8A", marginTop: -1,
  },

  // Loan cards
  loanGrid: { flexDirection: "row" as const, gap: 10, marginBottom: 10 },
  loanCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden" as const,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  loanCardGrad: { paddingVertical: 16, alignItems: "center" as const, justifyContent: "center" as const },
  loanCardLabel: { textAlign: "center" as const, fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1E293B", paddingVertical: 8 },

  // Steps
  stepRow: { flexDirection: "row" as const, marginBottom: 0 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center" as const, justifyContent: "center" as const, zIndex: 1 },
  stepNum: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: BLUE_LIGHT, alignSelf: "center" as const, marginVertical: 2, minHeight: 24 },
  stepContent: {
    flex: 1, flexDirection: "row" as const, alignItems: "flex-start" as const,
    gap: 10, marginLeft: 12, paddingBottom: 20,
  },
  stepIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: BLUE_SOFT, alignItems: "center" as const, justifyContent: "center" as const },
  stepTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
  stepSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 2, lineHeight: 17 },

  // Phone mockup
  phoneMockup: { alignItems: "center" as const, justifyContent: "center" as const, position: "relative" as const, height: 160 },
  phone: {
    width: 130, height: 130, borderRadius: 20,
    backgroundColor: "#1E293B", borderWidth: 5, borderColor: "#334155", overflow: "hidden" as const,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  phoneNotch: { width: 40, height: 10, backgroundColor: "#1E293B", borderRadius: 5, alignSelf: "center" as const, marginTop: 4, zIndex: 2 },
  phoneScreen: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, paddingTop: 4 },
  approvedBadge: { alignItems: "center" as const, gap: 4 },
  checkCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center" as const, justifyContent: "center" as const },
  approvedText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#16A34A" },
  loanAmtLabel: { fontSize: 9, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 6 },
  loanAmt: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#1E293B" },
  coins: { position: "absolute" as const, right: "14%" as any, bottom: 16, width: 32, height: 50 },
  coin: { position: "absolute" as const, width: 28, height: 10, borderRadius: 5, left: 0 },
  plane: { position: "absolute" as const, left: "10%" as any, top: 16, transform: [{ rotate: "330deg" }] },

  // Commitment illustration
  couch: { width: 200, height: 80, position: "absolute" as const, bottom: 12 },
  couchBack: { position: "absolute" as const, top: 0, left: 10, right: 10, height: 44, backgroundColor: "#3B82F6", borderRadius: 8 },
  couchSeat: { position: "absolute" as const, bottom: 14, left: 0, right: 0, height: 28, backgroundColor: "#2563EB", borderRadius: 8 },
  couchArm: { position: "absolute" as const, top: 14, width: 18, height: 38, backgroundColor: "#2563EB", borderRadius: 6 },
  couchLeg: { position: "absolute" as const, bottom: 0, width: 10, height: 16, backgroundColor: "#1D4ED8", borderRadius: 3 },
  person: { position: "absolute" as const, bottom: 44, alignItems: "center" as const },
  head: { width: 34, height: 36, borderRadius: 17 },
  body: { width: 36, height: 40, borderRadius: 8, marginTop: 2 },

  // Text
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#0F172A", lineHeight: 34, marginBottom: 8 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 19 },

  // Feature pills
  pill: { flexDirection: "row" as const, alignItems: "flex-start" as const, gap: 12 },
  pillIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center" as const, justifyContent: "center" as const },
  pillTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1E293B" },
  pillSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B", marginTop: 1, lineHeight: 16 },

  // Nav bar
  nav: {
    flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const,
    paddingHorizontal: 24, paddingTop: 12,
    backgroundColor: "#FAFBFF", borderTopWidth: 1, borderTopColor: "#EEF2FF",
  },
  skipBtn: { paddingVertical: 8, paddingHorizontal: 4, minWidth: 50 },
  skipText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#64748B" },
  dots: { flexDirection: "row" as const, gap: 6, alignItems: "center" as const },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: BLUE },
  nextBtn: {
    backgroundColor: BLUE, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 24,
    shadowColor: BLUE, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  nextText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  getStartedBtn: { borderRadius: 14, overflow: "hidden" as const },
  getStartedGrad: { paddingVertical: 15, alignItems: "center" as const },
  getStartedText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  signInLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#64748B" },
  signInLink: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: BLUE },
});

// ─── Sub-components ────────────────────────────────────────────────────────────

function FeaturePill({ icon, title, sub, iconBg = BLUE_SOFT, iconColor = BLUE }: {
  icon: string; title: string; sub: string; iconBg?: string; iconColor?: string;
}) {
  return (
    <View style={s.pill}>
      <View style={[s.pillIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.pillTitle}>{title}</Text>
        <Text style={s.pillSub}>{sub}</Text>
      </View>
    </View>
  );
}

function HouseIllustration() {
  return (
    <LinearGradient colors={["#C7DEFF", "#E8F1FF", "#EEF4FF"]} style={s.illuBg}>
      <View style={[s.cloud, { top: 28, left: 40, width: 72, height: 26 }]} />
      <View style={[s.cloud, { top: 20, left: 88, width: 50, height: 18 }]} />
      <View style={[s.cloud, { top: 44, right: 30, width: 80, height: 28 }]} />
      <View style={[s.cloud, { top: 32, right: 88, width: 42, height: 16 }]} />

      {/* Sun */}
      <View style={{ position: "absolute", top: 22, right: 44, width: 32, height: 32, borderRadius: 16, backgroundColor: "#FFD966" }} />

      {/* Left tree */}
      <View style={{ position: "absolute", bottom: 30, left: 28, alignItems: "center" }}>
        <View style={{ width: 38, height: 52, borderRadius: 19, backgroundColor: "#6DAF5B", marginBottom: -6 }} />
        <View style={{ width: 10, height: 22, backgroundColor: "#8B6914", borderRadius: 2 }} />
      </View>

      {/* Small right tree */}
      <View style={{ position: "absolute", bottom: 30, right: 70, alignItems: "center" }}>
        <View style={{ width: 28, height: 40, borderRadius: 14, backgroundColor: "#4D9E4D", marginBottom: -4 }} />
        <View style={{ width: 7, height: 18, backgroundColor: "#7A5B12", borderRadius: 2 }} />
      </View>

      {/* Right tree */}
      <View style={{ position: "absolute", bottom: 30, right: 22, alignItems: "center" }}>
        <View style={{ width: 44, height: 60, borderRadius: 22, backgroundColor: "#5BA05B", marginBottom: -6 }} />
        <View style={{ width: 10, height: 26, backgroundColor: "#8B6914", borderRadius: 2 }} />
      </View>

      {/* House */}
      <View style={{ position: "absolute", bottom: 28, left: 70, right: 70 }}>
        <View style={s.roofShadow} />
        <View style={s.roof} />
        {/* Chimney */}
        <View style={{ position: "absolute", top: -58, right: 46, width: 16, height: 30, backgroundColor: "#1E3A8A", borderRadius: 2 }} />
        <View style={s.houseBody}>
          <View style={s.garage}>
            <View style={s.garageInner} />
          </View>
          <View style={s.door}>
            <View style={s.doorKnob} />
            <View style={{ position: "absolute", top: -8, left: 0, right: 0, height: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: "#1a3e8f" }} />
          </View>
          <View style={s.window}>
            <View style={s.windowCross} />
            <View style={s.windowCrossH} />
          </View>
          <View style={[s.window, { right: 12, left: undefined }]}>
            <View style={s.windowCross} />
            <View style={s.windowCrossH} />
          </View>
        </View>
      </View>

      {/* Ground */}
      <View style={{ position: "absolute", bottom: 22, left: 0, right: 0, height: 12, backgroundColor: "#B8D9A0", borderRadius: 4 }} />
    </LinearGradient>
  );
}

function LoanTypeCard({ emoji, label, color }: { emoji: string; label: string; color: string }) {
  return (
    <View style={s.loanCard}>
      <LinearGradient colors={[color + "22", color + "10"]} style={s.loanCardGrad}>
        <Text style={{ fontSize: 36 }}>{emoji}</Text>
      </LinearGradient>
      <Text style={s.loanCardLabel}>{label}</Text>
    </View>
  );
}

function LoansIllustration() {
  return (
    <LinearGradient colors={["#F0F5FF", "#FAFBFF"]} style={[s.illuBg, { justifyContent: "center", paddingHorizontal: 16 }]}>
      <View style={s.loanGrid}>
        <LoanTypeCard emoji="🏠" label="Home Loan"       color="#1E56E5" />
        <LoanTypeCard emoji="🚗" label="Car Loan"        color="#0EA5E9" />
      </View>
      <View style={s.loanGrid}>
        <LoanTypeCard emoji="🎓" label="Education Loan"  color="#8B5CF6" />
        <LoanTypeCard emoji="💼" label="Personal Loan"   color="#F59E0B" />
      </View>
      <View style={{ paddingHorizontal: 44 }}>
        <LoanTypeCard emoji="🏪" label="Business Loan"   color="#10B981" />
      </View>
    </LinearGradient>
  );
}

function StepItem({ num, icon, title, sub }: { num: number; icon: string; title: string; sub: string }) {
  return (
    <View style={s.stepRow}>
      <View style={{ alignItems: "center" }}>
        <LinearGradient colors={[BLUE, BLUE_MID]} style={s.stepCircle}>
          <Text style={s.stepNum}>{num}</Text>
        </LinearGradient>
        {num < 3 && <View style={s.stepLine} />}
      </View>
      <View style={s.stepContent}>
        <View style={s.stepIcon}>
          <Feather name={icon as any} size={15} color={BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.stepTitle}>{title}</Text>
          <Text style={s.stepSub}>{sub}</Text>
        </View>
      </View>
    </View>
  );
}

function PhoneMockup() {
  return (
    <View style={s.phoneMockup}>
      <View style={s.phone}>
        <View style={s.phoneNotch} />
        <LinearGradient colors={["#F0F5FF", "#E8F0FE"]} style={s.phoneScreen}>
          <View style={s.approvedBadge}>
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={s.checkCircle}>
              <Feather name="check" size={22} color="white" />
            </LinearGradient>
            <Text style={s.approvedText}>Approved!</Text>
          </View>
          <Text style={s.loanAmtLabel}>Loan Amount</Text>
          <Text style={s.loanAmt}>$5,000,000</Text>
        </LinearGradient>
      </View>
      <View style={s.coins}>
        {[0, 1, 2, 3].map((i) => (
          <LinearGradient key={i} colors={["#FFD700", "#F59E0B"]} style={[s.coin, { bottom: i * 7 }]} />
        ))}
      </View>
      <View style={s.plane}>
        <Feather name="send" size={24} color={BLUE} />
      </View>
    </View>
  );
}

function CommitmentIllustration() {
  return (
    <LinearGradient colors={["#EEF4FF", "#DBEAFE", "#E8F1FF"]} style={[s.illuBg, { alignItems: "center", justifyContent: "center" }]}>
      {/* Couch */}
      <View style={s.couch}>
        <View style={s.couchBack} />
        <View style={s.couchSeat} />
        <View style={[s.couchArm, { left: 0 }]} />
        <View style={[s.couchArm, { right: 0 }]} />
        <View style={[s.couchLeg, { left: 20 }]} />
        <View style={[s.couchLeg, { right: 20 }]} />
      </View>

      {/* Person 1 (woman left) */}
      <View style={[s.person, { left: "20%" }]}>
        <View style={[s.head, { backgroundColor: "#FDDCB5" }]}>
          <View style={{ position: "absolute", top: -4, left: 2, right: 2, height: 16, backgroundColor: "#5C3A1E", borderRadius: 8 }} />
          <View style={{ position: "absolute", top: 6, left: -4, width: 8, height: 20, backgroundColor: "#5C3A1E", borderRadius: 4 }} />
          <View style={{ position: "absolute", top: 6, right: -4, width: 8, height: 20, backgroundColor: "#5C3A1E", borderRadius: 4 }} />
        </View>
        <View style={[s.body, { backgroundColor: "#F87171" }]} />
        <View style={{ position: "absolute", bottom: 8, right: -14, width: 14, height: 20, backgroundColor: "#1E293B", borderRadius: 3, borderWidth: 1.5, borderColor: "#94A3B8" }} />
      </View>

      {/* Person 2 (man right) */}
      <View style={[s.person, { right: "20%" }]}>
        <View style={[s.head, { backgroundColor: "#FDDCB5" }]}>
          <View style={{ position: "absolute", top: -6, left: 0, right: 0, height: 14, backgroundColor: "#3B1F0A", borderRadius: 8 }} />
        </View>
        <View style={[s.body, { backgroundColor: "#3B82F6" }]} />
        <View style={{ position: "absolute", bottom: 10, left: -18, width: 22, height: 16, backgroundColor: "#1E293B", borderRadius: 3, borderWidth: 1.5, borderColor: "#94A3B8" }} />
      </View>

      {/* Floor lamp */}
      <View style={{ position: "absolute", right: "6%", bottom: 0, alignItems: "center" }}>
        <View style={{ width: 28, height: 24, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: "#FCD34D", borderWidth: 2, borderColor: "#F59E0B" }} />
        <View style={{ width: 4, height: 60, backgroundColor: "#94A3B8" }} />
        <View style={{ width: 20, height: 4, backgroundColor: "#94A3B8", borderRadius: 2 }} />
      </View>

      {/* Potted plant */}
      <View style={{ position: "absolute", left: "5%", bottom: 4, alignItems: "center" }}>
        <View style={{ width: 22, height: 12, backgroundColor: "#78716C", borderRadius: 3 }} />
        <View style={{ position: "absolute", top: -30, width: 20, height: 34, alignItems: "center" }}>
          <View style={{ width: 10, height: 18, backgroundColor: "#16A34A", borderRadius: 8, transform: [{ rotate: "-20deg" }], marginBottom: -6 }} />
          <View style={{ width: 10, height: 18, backgroundColor: "#15803D", borderRadius: 8, transform: [{ rotate: "20deg" }], marginBottom: -6 }} />
          <View style={{ width: 8, height: 14, backgroundColor: "#22C55E", borderRadius: 6 }} />
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

  const goToApp = () => router.replace("/(tabs)");
  const isLast = current === 3;

  const SLIDES = [
    {
      key: "s1",
      illustration: <HouseIllustration />,
      illuFlex: 1.4,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={s.title}>Big Plans?{"\n"}Smart Support!</Text>
          <Text style={s.subtitle}>Loans made simple,{"\n"}so you can focus on what matters most.</Text>
          <View style={{ gap: 10, marginTop: 14 }}>
            <FeaturePill icon="zap"     title="Quick & Easy"          sub="Apply in minutes and get quick approvals."    iconBg="#EEF4FF" iconColor={BLUE} />
            <FeaturePill icon="shield"  title="Secure & Trusted"      sub="Bank-level security to keep you protected."   iconBg="#F0FDF4" iconColor="#16A34A" />
            <FeaturePill icon="percent" title="Flexible & Affordable"  sub="Choose loans that fit your needs and budget." iconBg="#FEF3C7" iconColor="#D97706" />
          </View>
        </View>
      ),
    },
    {
      key: "s2",
      illustration: <LoansIllustration />,
      illuFlex: 1.6,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
          <Text style={[s.title, { textAlign: "center" }]}>Loans for{"\n"}Every Dream</Text>
          <Text style={[s.subtitle, { textAlign: "center" }]}>From your dream home to your next big plan, we've got you covered.</Text>
        </View>
      ),
    },
    {
      key: "s3",
      content: (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 6 }}>
            <Text style={s.title}>Simple Steps,{"\n"}Smarter Loans</Text>
            <Text style={s.subtitle}>A hassle-free process designed just for you.</Text>
          </View>
          <View style={{ paddingHorizontal: 24 }}>
            <StepItem num={1} icon="edit-3"       title="Apply Online"       sub="Fill in a simple form in just a few minutes." />
            <StepItem num={2} icon="check-circle" title="Get Quick Approval" sub="Our smart system reviews and approves faster." />
            <StepItem num={3} icon="dollar-sign"  title="Get Funds"          sub="Receive funds directly in your bank account." />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <PhoneMockup />
          </View>
        </View>
      ),
    },
    {
      key: "s4",
      illustration: <CommitmentIllustration />,
      illuFlex: 1.3,
      content: (
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={s.title}>Your Journey,{"\n"}Our Commitment</Text>
          <Text style={s.subtitle}>We're here to support you at every step of the way.</Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            <FeaturePill icon="headphones" title="24/7 Support"       sub="We're always here whenever you need us."   iconBg="#EEF4FF" iconColor={BLUE} />
            <FeaturePill icon="bell"       title="Real-time Updates"  sub="Track your application anytime, anywhere." iconBg="#F0FDF4" iconColor="#16A34A" />
            <FeaturePill icon="thumbs-up"  title="Built for You"      sub="Smart, reliable and designed around you."  iconBg="#FEF3C7" iconColor="#D97706" />
          </View>
        </View>
      ),
    },
  ] as const;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
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
            {slide.key === "s3" ? (
              <View style={{ flex: 1 }}>{slide.content}</View>
            ) : (
              <>
                <View style={{ flex: (slide as any).illuFlex }}>
                  {(slide as any).illustration}
                </View>
                <View style={{ flex: 1.6 }}>{slide.content}</View>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[s.nav, { paddingBottom: insets.bottom + 12 }]}>
        {!isLast ? (
          <>
            <TouchableOpacity onPress={goToApp} style={s.skipBtn} activeOpacity={0.7}>
              <Text style={s.skipText}>Skip</Text>
            </TouchableOpacity>
            <View style={s.dots}>
              {[0, 1, 2, 3].map((i) => (
                <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.8}>
                  <View style={[s.dot, i === current && s.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => goTo(current + 1)} style={s.nextBtn} activeOpacity={0.85}>
              <Text style={s.nextText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ width: "100%", gap: 14 }}>
            <View style={[s.dots, { justifyContent: "center" }]}>
              {[0, 1, 2, 3].map((i) => (
                <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.8}>
                  <View style={[s.dot, i === current && s.dotActive]} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={goToApp} style={s.getStartedBtn} activeOpacity={0.88}>
              <LinearGradient colors={[BLUE, BLUE_MID]} style={s.getStartedGrad}>
                <Text style={s.getStartedText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
              <Text style={s.signInLabel}>Already have an account?</Text>
              <TouchableOpacity onPress={goToApp} activeOpacity={0.7}>
                <Text style={s.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

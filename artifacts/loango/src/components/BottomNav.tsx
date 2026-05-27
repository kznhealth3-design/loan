import { useLocation, Link } from "wouter";
import { Home, FileText, CreditCard, Gift, MoreHorizontal } from "lucide-react";

const tabs = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/my-loans", label: "My Loans", icon: FileText },
  { href: "/emi-payments", label: "EMI Payments", icon: CreditCard },
  { href: "/offers", label: "Offers", icon: Gift },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 z-50 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <button className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[52px]">
                <Icon
                  size={22}
                  className={active ? "text-[#4F46E5]" : "text-gray-400"}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className={`text-[10px] font-medium leading-tight ${
                    active ? "text-[#4F46E5]" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

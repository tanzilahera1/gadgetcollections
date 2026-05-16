// src/components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  History,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DASHBOARD_LINKS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/my-orders", icon: ShoppingBag },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Addresses", href: "/dashboard/addresses", icon: MapPin },
  { label: "Payment History", href: "/dashboard/payments", icon: History },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden sticky top-24">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Account
          </h2>
          <p className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Dashboard
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {DASHBOARD_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-200 group",
                      active
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <link.icon
                      className={cn(
                        "size-5",
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-900",
                      )}
                    />
                    <span className="flex-1">{link.label}</span>
                    <ChevronRight
                      className={cn(
                        "size-4 transition-all opacity-0 group-hover:opacity-100",
                        active
                          ? "opacity-100 translate-x-1"
                          : "group-hover:translate-x-1",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 bg-slate-900 text-white mt-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 size-32 bg-primary/20 rounded-full blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-125" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
            Need Support?
          </p>
          <p className="text-xs font-medium text-slate-400 mb-4 leading-relaxed">
            Our support team is here for you 24/7.
          </p>
          <Link href="/help">
            <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-black uppercase tracking-widest transition-all">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}

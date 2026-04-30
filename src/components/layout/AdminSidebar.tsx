"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Tags,
  Settings,
  LogOut,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Layers },
  { label: "Brands", href: "/admin/brands", icon: Tags },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapsed, isMobileOpen, setMobileOpen } =
    useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col",
          "bg-background/80 backdrop-blur-2xl border-r border-border/50 shadow-2xl shadow-black/5",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Subtle gradient overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent pointer-events-none" />

        {/* Sidebar Header */}
        <div
          className={cn(
            "relative h-16 flex items-center border-b border-border/40 px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <div className="flex flex-col ml-1 overflow-hidden whitespace-nowrap">
              <span className="text-sm font-black text-foreground tracking-tight leading-none">
                Admin Panel
              </span>
              <Link
                href="/"
                className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors mt-0.5 tracking-wide"
              >
                ← Back to Store
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden lg:flex rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/60 h-8 w-8"
          >
            {isCollapsed ? (
              <PanelLeft className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-xl text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.label : ""}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group relative",
                  isCollapsed ? "justify-center h-12 w-full" : "px-4 py-3 gap-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-foreground hover:bg-accent/60",
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0 transition-all",
                    isActive
                      ? "text-primary-foreground"
                      : "text-foreground/70 group-hover:text-foreground",
                  )}
                />

                {!isCollapsed && (
                  <>
                    <span className="font-semibold text-sm tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="size-3.5 ml-auto opacity-60" />
                    )}
                  </>
                )}

                {/* Collapsed active indicator */}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-primary rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className={cn(
            "relative p-3 border-t border-border/40",
            isCollapsed ? "flex justify-center" : "",
          )}
        >
          <Button
            variant="ghost"
            className={cn(
              "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all duration-200",
              isCollapsed
                ? "size-12 p-0"
                : "w-full flex items-center justify-start gap-3 px-4 h-11",
            )}
          >
            <LogOut className="size-4 shrink-0" />
            {!isCollapsed && <span className="font-semibold text-sm">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}

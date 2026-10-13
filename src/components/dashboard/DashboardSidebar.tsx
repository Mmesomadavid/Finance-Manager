import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { primaryNav, secondaryNav, type NavItem } from "./navigation";

/* ------------------------------- nav link ------------------------------- */

type NavItemLinkProps = {
  item: NavItem;
  expanded: boolean;
  onNavigate?: () => void;
};

const NavItemLink = ({
  item,
  expanded,
  onNavigate,
}: NavItemLinkProps) => (
  <NavLink
    to={item.path}
    end={item.end}
    onClick={onNavigate}
    aria-label={item.title}
    className={({ isActive }) =>
      cn(
        "group relative flex h-11 items-center outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40",
        expanded
          ? "w-full gap-3 rounded-xl px-3 text-sm font-medium"
          : "w-11 justify-center rounded-full",
        isActive
          ? "bg-[#8b5cf6] text-white shadow-lg shadow-purple-300/50"
          : expanded
            ? "text-[#7b7683] hover:bg-[#f3f0fa] hover:text-[#6d28d9]"
            : "border border-[#e8e8ec] bg-[#f3f3f5] text-[#7b7683] hover:bg-[#ece6fb] hover:text-[#6d28d9]",
      )
    }
  >
    <item.icon size={19} strokeWidth={1.8} />

    {expanded ? (
      <span>{item.title}</span>
    ) : (
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-md bg-[#17131e] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      >
        {item.title}
      </span>
    )}
  </NavLink>
);

/* ------------------------------ sidebar body ----------------------------- */

type SidebarBodyProps = {
  expanded: boolean;
  onNavigate?: () => void;
};

const SidebarBody = ({
  expanded,
  onNavigate,
}: SidebarBodyProps) => (
  <div
    className={cn(
      "flex h-full flex-col",
      expanded ? "px-1" : "items-center",
    )}
  >
    <NavLink
      to="/dashboard"
      onClick={onNavigate}
      aria-label="ExpenseFlow dashboard"
      className="flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]/40"
    >
      {/* Custom SVG E logo */}
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#8b5cf6] text-white shadow-md shadow-purple-300/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          width="28"
          height="28"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M29 8H13.5C10.5 8 9 9.5 9 12.5V27.5C9 30.5 10.5 32 13.5 32H29"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M11 20H25"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M13 8V32"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {expanded && (
        <span className="text-[17px] font-bold tracking-tight text-[#17131e]">
          Expense<span className="text-[#8b5cf6]">Flow</span>
        </span>
      )}
    </NavLink>

    <nav
      aria-label="Main"
      className={cn(
        "mt-8 flex flex-col",
        expanded ? "gap-1" : "items-center gap-3",
      )}
    >
      {primaryNav.map((item) => (
        <NavItemLink
          key={item.path}
          item={item}
          expanded={expanded}
          onNavigate={onNavigate}
        />
      ))}
    </nav>

    <div
      className={cn(
        "my-5 h-px bg-[#e8e8ec]",
        expanded ? "w-full" : "w-6",
      )}
    />

    <nav
      aria-label="Preferences"
      className={cn(
        "flex flex-col",
        expanded ? "gap-1" : "items-center gap-3",
      )}
    >
      {secondaryNav.map((item) => (
        <NavItemLink
          key={item.path}
          item={item}
          expanded={expanded}
          onNavigate={onNavigate}
        />
      ))}
    </nav>

    <div className="flex-1" />

    <div
      className={cn(
        "flex items-center gap-3",
        expanded && "rounded-xl bg-[#f7f5fa] p-3",
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fde047] text-sm font-bold text-[#5b4a00] ring-2 ring-white"
      >
        M
      </div>

      {expanded && (
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#292332]">
            My Account
          </p>
          <p className="truncate text-[11px] text-[#9b94a5]">
            Personal workspace
          </p>
        </div>
      )}
    </div>
  </div>
);

/* -------------------------------- sidebar -------------------------------- */

type DashboardSidebarProps = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const DashboardSidebar = ({
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) => {
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop: slim icon rail */}
      <aside className="sticky top-0 z-40 hidden h-screen shrink-0 p-3 lg:block">
        <div className="h-full w-[72px] rounded-2xl border border-[#ececf0] bg-white py-4 shadow-sm">
          <SidebarBody expanded={false} />
        </div>
      </aside>

      {/* Mobile: slide-in drawer with labels */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                duration: 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="fixed inset-y-0 left-0 z-50 w-[270px] bg-white p-4 shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={onMobileClose}
                aria-label="Close menu"
                className="absolute right-3 top-5 rounded-lg p-2 text-[#827b8d] transition-colors hover:bg-[#f3f0fa]"
              >
                <X size={18} />
              </button>

              <SidebarBody
                expanded
                onNavigate={onMobileClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;

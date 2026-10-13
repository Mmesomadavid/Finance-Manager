import {
  ArrowLeftRight,
  ChartNoAxesCombined,
  CircleHelp,
  LayoutDashboard,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  /** Match the exact path only (used for the dashboard home). */
  end?: boolean;
};

export const primaryNav: NavItem[] = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Accounts", path: "/dashboard/accounts", icon: Wallet },
  { title: "Transactions", path: "/dashboard/transactions", icon: ArrowLeftRight },
  { title: "Budgets", path: "/dashboard/budgets", icon: ChartNoAxesCombined },
];

export const secondaryNav: NavItem[] = [
  { title: "Settings", path: "/dashboard/settings", icon: Settings },
  { title: "Help & Support", path: "/dashboard/support", icon: CircleHelp },
];

/** Resolves the page title for the header breadcrumb using the longest matching route. */
export const getPageTitle = (pathname: string) => {
  const match = [...primaryNav, ...secondaryNav]
    .filter(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.title ?? "Dashboard";
};
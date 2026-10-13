import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, ChevronRight, House, Menu, Search } from "lucide-react";

import { getPageTitle } from "./navigation";

const notifications = [
  { id: 1, title: "Netflix Subscription is due today", time: "10:30 AM" },
  { id: 2, title: "Figma Membership renews tomorrow", time: "9:00 AM" },
  { id: 3, title: "You've used 80% of your Food budget", time: "Yesterday" },
];

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.userAgent);

type DashboardHeaderProps = {
  onMenuClick: () => void;
};

const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  const searchRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unread, setUnread] = useState(true);

  /* Cmd/Ctrl + K focuses search */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Close notifications on outside click or Escape */
  useEffect(() => {
    if (!notificationsOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!bellRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e6e6ea] bg-[#f4f4f6]/85 backdrop-blur-md">
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="-ml-1 rounded-full p-2 text-[#6f6878] transition-colors hover:bg-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <NavLink
              to="/dashboard"
              aria-label="Dashboard home"
              className="rounded-full p-1 text-[#6f6878] transition-colors hover:text-[#8b5cf6]"
            >
              <House size={18} />
            </NavLink>
            <ChevronRight size={15} className="shrink-0 text-[#a8a1b0]" />
            <span
              aria-current="page"
              className="truncate text-sm font-medium text-[#211d28]"
            >
              {pageTitle}
            </span>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="group relative hidden md:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8d8696]"
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search everything..."
              aria-label="Search"
              onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
              className="h-10 w-56 rounded-full border border-transparent bg-white pl-10 pr-14 text-xs text-[#211d28] shadow-sm outline-none transition-all placeholder:text-[#9d96a5] focus:w-72 focus:border-[#d9ccf7] focus:ring-4 focus:ring-[#8b5cf6]/10 lg:w-72 lg:focus:w-80"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-[#ececf0] bg-[#f7f7f9] px-1.5 py-0.5 font-sans text-[10px] font-medium text-[#8d8696] transition-opacity group-focus-within:opacity-0">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </div>

          {/* Notifications */}
          <div ref={bellRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label={unread ? "Notifications, you have unread" : "Notifications"}
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#6f6878] transition-colors hover:bg-white"
            >
              <Bell size={18} />
              {unread && (
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-[#f4f4f6] bg-[#f87171]" />
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-2xl border border-[#ececf0] bg-white shadow-xl shadow-black/[0.08]"
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-semibold text-[#211d28]">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setUnread(false)}
                      disabled={!unread}
                      className="flex items-center gap-1 text-xs font-medium text-[#8b5cf6] transition-colors hover:text-[#6d28d9] disabled:text-[#b4adbd]"
                    >
                      <Check size={13} /> Mark all read
                    </button>
                  </div>

                  <ul className="border-t border-[#f1eef4]">
                    {notifications.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#faf8fc]"
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            unread ? "bg-[#8b5cf6]" : "bg-[#d9d2e3]"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#302a38]">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-[#a099aa]">{item.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            className="h-10 rounded-full bg-[#19cda6] px-4 text-sm font-semibold text-[#073e32] transition-colors hover:bg-[#10b991] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19cda6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f4f6]"
          >
            Earn $100
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  /* Reset scroll when the route changes */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f4f4f6] text-[#211d28]">
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-[#17131e] px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        <DashboardSidebar
          key={pathname}
          mobileOpen={mobileOpen}
          onMobileClose={closeMobile}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            onMenuClick={() => setMobileOpen(true)}
          />

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 px-4 pb-10 pt-6 outline-none sm:px-6 lg:px-8"
          >
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto w-full max-w-[1500px]"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

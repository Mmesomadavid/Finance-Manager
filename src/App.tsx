
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Auth/Login"
import Signup from "./pages/Auth/Signup";

// Dashboard layout
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import DashboardAccounts from "./pages/Dashboard/Accounts";
import DashboardTransactions from "./pages/Dashboard/Transactions";
import DashboardBudgets from "./pages/Dashboard/Budgets";
import DashboardSettings from "./pages/Dashboard/Settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup/>} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="accounts" element={<DashboardAccounts />} />
        <Route path="transactions" element={<DashboardTransactions />} />
        <Route path="budgets" element={<DashboardBudgets />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="support" element={<div>Help & Support</div>} />
      </Route>

      <Route
        path="*"
        element={<div className="p-8">Page not found.</div>}
      />
    </Routes>
  );
}

export default App;

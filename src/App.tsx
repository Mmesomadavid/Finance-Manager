
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup/>} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        {/* <Route path="accounts" element={<Accounts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="settings" element={<Settings />} />
        <Route path="support" element={<div>Help & Support</div>} /> */}
      </Route>

      <Route
        path="*"
        element={<div className="p-8">Page not found.</div>}
      />
    </Routes>
  );
}

export default App;

import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import Layout from "@/components/layout";
import AuthPage from "@/pages/auth";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminEmployees from "@/pages/admin-employees";
import AdminAttendance from "@/pages/admin-attendance";
import AdminLeaves from "@/pages/admin-leaves";
import AdminSettings from "@/pages/admin-settings";
import AdminReports from "@/pages/admin-reports";
import PayrollList from "@/pages/payroll-list";
import PayrollSlip from "@/pages/payroll-slip";
import AttendanceCapture from "@/pages/attendance-capture";
import EmployeeDashboard from "@/pages/employee-dashboard";
import EmployeeLeave from "@/pages/employee-leave";
import EmployeePayslips from "@/pages/employee-payslips";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Auth */}
        <Route path="/" component={AuthPage} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/employees" component={AdminEmployees} />
        <Route path="/admin/attendance" component={AdminAttendance} />
        <Route path="/admin/leaves" component={AdminLeaves} />
        <Route path="/admin/payroll" component={PayrollList} />
        <Route path="/admin/payroll/:id" component={PayrollSlip} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/reports" component={AdminReports} />

        {/* Employee Routes */}
        <Route path="/employee" component={EmployeeDashboard} />
        <Route path="/employee/attendance" component={AttendanceCapture} />
        <Route path="/employee/leave" component={EmployeeLeave} />
        <Route path="/employee/payslips" component={EmployeePayslips} />
        <Route path="/employee/payslips/:id" component={PayrollSlip} />

        {/* Shared */}
        <Route path="/profile" component={ProfilePage} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;

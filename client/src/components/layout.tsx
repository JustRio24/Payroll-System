import React from "react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  DollarSign, 
  Settings, 
  LogOut, 
  Menu,
  FileText,
  Briefcase,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import generatedLogo from "@assets/generated_images/minimalist_geometric_construction_logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useApp();
  const [location] = useLocation();

  if (!user) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {children}
    </div>;
  }

  const isAdmin = user.role === "admin";

  const navItems = isAdmin ? [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Employees", href: "/admin/employees" },
    { icon: CalendarCheck, label: "Attendance", href: "/admin/attendance" },
    { icon: Briefcase, label: "Leaves", href: "/admin/leaves" },
    { icon: DollarSign, label: "Payroll", href: "/admin/payroll" },
    { icon: FileText, label: "Reports", href: "/admin/reports" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
    { icon: Building2, label: "About", href: "/about" },
  ] : [
    { icon: LayoutDashboard, label: "Dashboard", href: "/employee" },
    { icon: CalendarCheck, label: "My Attendance", href: "/employee/attendance" },
    { icon: Briefcase, label: "Leave Requests", href: "/employee/leave" },
    { icon: FileText, label: "My Payslips", href: "/employee/payslips" },
    { icon: Building2, label: "About", href: "/about" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img src={generatedLogo} alt="Panca Karya" className="w-8 h-8 rounded object-contain bg-white p-0.5" />
          <h1 className="font-display font-bold text-lg tracking-tight">Panca Karya</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 pl-11">Construction HRIS</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive 
                    ? "bg-orange-500 text-white shadow-md" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link href="/profile">
          <div className="flex items-center gap-3 mb-4 px-2 cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors">
            <Avatar className="w-8 h-8 border border-slate-700">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-slate-700 text-xs">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
            </div>
            <Settings className="w-4 h-4 text-slate-500" />
          </div>
        </Link>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-white">
           <img src={generatedLogo} alt="Panca Karya" className="w-8 h-8 rounded object-contain bg-white p-0.5" />
           <span className="font-bold">Panca Karya</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-slate-900 text-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

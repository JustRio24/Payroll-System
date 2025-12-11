import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { format, subMonths } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "./queryClient";

// --- Types ---

export type Role = "admin" | "employee";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  positionId?: number | null;
  position?: string;
  joinDate?: string | null;
  password?: string;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  clockInPhoto?: string | null;
  clockOutPhoto?: string | null;
  clockInLat?: string | null;
  clockInLng?: string | null;
  clockOutLat?: string | null;
  clockOutLng?: string | null;
  clockInLocation?: { lat: number; lng: number; address?: string };
  clockOutLocation?: { lat: number; lng: number; address?: string };
  status: "present" | "late" | "absent" | "leave" | "sick";
  approvalStatus: "pending" | "approved" | "rejected";
  notes?: string | null;
  isWithinGeofenceIn?: boolean;
  isWithinGeofenceOut?: boolean;
}

export interface LeaveRequest {
  id: number;
  userId: number;
  type: "annual" | "sick" | "other";
  startDate: string;
  endDate: string;
  reason?: string | null;
  status: "pending" | "approved" | "rejected";
  attachment?: string | null;
  approvedBy?: number | null;
}

export interface PayrollRecord {
  id: number;
  userId: number;
  period: string;
  basicSalary: number;
  overtimePay: number;
  bonus: number;
  lateDeduction: number;
  bpjsDeduction: number;
  pph21Deduction: number;
  otherDeduction: number;
  deductions: {
    late: number;
    bpjs: number;
    pph21: number;
    other: number;
  };
  totalNet: number;
  status: "draft" | "final";
  generatedAt?: string;
}

export interface JobPosition {
  id?: number;
  title: string;
  hourlyRate: number;
  description?: string | null;
}

export interface AppConfig {
  officeLat: number;
  officeLng: number;
  geofenceRadius: number;
  latePenaltyPerMinute: number;
  breakDurationMinutes: number;
  bpjsKesehatanRate: number;
  bpjsKetenagakerjaanRate: number;
  companyName: string;
  companyAddress: string;
  vision?: string;
  mission?: string;
  history?: string;
}

// --- Default Config ---
const DEFAULT_CONFIG: AppConfig = {
  officeLat: -2.9795731113284303,
  officeLng: 104.73111003716011,
  geofenceRadius: 100,
  latePenaltyPerMinute: 2000,
  breakDurationMinutes: 60,
  bpjsKesehatanRate: 0.01,
  bpjsKetenagakerjaanRate: 0.02,
  companyName: "PT Panca Karya Utama",
  companyAddress: "Jl. Konstruksi No. 123, Palembang",
  vision: "Menjadi perusahaan konstruksi terkemuka yang terpercaya.",
  mission: "Memberikan layanan berkualitas tinggi dan mengutamakan keselamatan kerja.",
  history: "Didirikan pada tahun 2010, PT Panca Karya Utama telah mengerjakan berbagai proyek..."
};

// --- Utils ---

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Helper to normalize attendance records from API
function normalizeAttendance(record: any): AttendanceRecord {
  return {
    ...record,
    date: typeof record.date === 'string' ? record.date.split('T')[0] : record.date,
    clockIn: record.clockIn || record.clock_in,
    clockOut: record.clockOut || record.clock_out,
    clockInPhoto: record.clockInPhoto || record.clock_in_photo,
    clockOutPhoto: record.clockOutPhoto || record.clock_out_photo,
    isWithinGeofenceIn: record.isWithinGeofenceIn ?? record.is_within_geofence_in ?? false,
    isWithinGeofenceOut: record.isWithinGeofenceOut ?? record.is_within_geofence_out ?? false,
    clockInLocation: record.clockInLat ? { lat: parseFloat(record.clockInLat), lng: parseFloat(record.clockInLng) } : undefined,
    clockOutLocation: record.clockOutLat ? { lat: parseFloat(record.clockOutLat), lng: parseFloat(record.clockOutLng) } : undefined,
    approvalStatus: record.approvalStatus || record.approval_status || 'pending',
  };
}

// Helper to normalize payroll records from API
function normalizePayroll(record: any): PayrollRecord {
  return {
    ...record,
    deductions: {
      late: record.lateDeduction || record.late_deduction || 0,
      bpjs: record.bpjsDeduction || record.bpjs_deduction || 0,
      pph21: record.pph21Deduction || record.pph21_deduction || 0,
      other: record.otherDeduction || record.other_deduction || 0,
    },
    basicSalary: record.basicSalary || record.basic_salary || 0,
    overtimePay: record.overtimePay || record.overtime_pay || 0,
    totalNet: record.totalNet || record.total_net || 0,
    generatedAt: record.generatedAt || record.generated_at,
  };
}

// Helper to normalize leave records
function normalizeLeave(record: any): LeaveRequest {
  return {
    ...record,
    startDate: typeof record.startDate === 'string' ? record.startDate.split('T')[0] : 
               typeof record.start_date === 'string' ? record.start_date.split('T')[0] : record.startDate,
    endDate: typeof record.endDate === 'string' ? record.endDate.split('T')[0] : 
             typeof record.end_date === 'string' ? record.end_date.split('T')[0] : record.endDate,
    approvedBy: record.approvedBy || record.approved_by,
  };
}

// --- Context ---

interface AppContextType {
  user: User | null;
  users: User[];
  positions: JobPosition[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrolls: PayrollRecord[];
  config: AppConfig;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  clockIn: (lat: number, lng: number, photo: string) => Promise<void>;
  clockOut: (lat: number, lng: number, photo: string) => Promise<void>;
  requestLeave: (data: Omit<LeaveRequest, "id" | "status" | "userId">) => Promise<void>;
  updateConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  approveAttendance: (id: number, status: "approved" | "rejected") => Promise<void>;
  approveLeave: (id: number, status: "approved" | "rejected") => Promise<void>;
  addPosition: (position: JobPosition) => Promise<void>;
  deletePosition: (id: number) => Promise<void>;
  generatePayroll: (period: string) => Promise<void>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  finalizePayroll: (id: number) => Promise<void>;
  createUser: (data: Omit<User, "id">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [usersRes, positionsRes, attendanceRes, leavesRes, payrollsRes, configRes] = await Promise.all([
        fetch('/api/users').then(r => r.json()).catch(() => []),
        fetch('/api/positions').then(r => r.json()).catch(() => []),
        fetch('/api/attendance').then(r => r.json()).catch(() => []),
        fetch('/api/leaves').then(r => r.json()).catch(() => []),
        fetch('/api/payroll').then(r => r.json()).catch(() => []),
        fetch('/api/config').then(r => r.json()).catch(() => ({})),
      ]);

      // Merge position titles into users
      const usersWithPositions = usersRes.map((u: any) => {
        const pos = positionsRes.find((p: any) => p.id === u.positionId);
        return {
          ...u,
          position: pos?.title || u.position || 'Unknown',
          joinDate: u.joinDate ? u.joinDate.split('T')[0] : u.join_date?.split('T')[0],
        };
      });

      setUsers(usersWithPositions);
      setPositions(positionsRes);
      setAttendance(attendanceRes.map(normalizeAttendance));
      setLeaves(leavesRes.map(normalizeLeave));
      setPayrolls(payrollsRes.map(normalizePayroll));
      
      // Merge config
      if (configRes && typeof configRes === 'object') {
        setConfig(prev => ({
          ...prev,
          companyName: configRes.companyName || prev.companyName,
          companyAddress: configRes.companyAddress || prev.companyAddress,
          officeLat: parseFloat(configRes.officeLat) || prev.officeLat,
          officeLng: parseFloat(configRes.officeLng) || prev.officeLng,
          geofenceRadius: parseInt(configRes.geofenceRadius) || prev.geofenceRadius,
          latePenaltyPerMinute: parseInt(configRes.latePenaltyPerMinute) || prev.latePenaltyPerMinute,
          breakDurationMinutes: parseInt(configRes.breakDurationMinutes) || prev.breakDurationMinutes,
          bpjsKesehatanRate: parseFloat(configRes.bpjsKesehatanRate) || prev.bpjsKesehatanRate,
          bpjsKetenagakerjaanRate: parseFloat(configRes.bpjsKetenagakerjaanRate) || prev.bpjsKetenagakerjaanRate,
          vision: configRes.vision || prev.vision,
          mission: configRes.mission || prev.mission,
          history: configRes.history || prev.history,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({ title: "Error", description: "Failed to load data from server", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = async () => {
    await fetchData();
  };

  const login = async (email: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { email, password: 'password' });
      const userData = await response.json();
      
      // Add position title
      const pos = positions.find(p => p.id === userData.positionId);
      const userWithPosition = {
        ...userData,
        position: pos?.title || 'Unknown',
      };
      
      setUser(userWithPosition);
      toast({ title: "Welcome back!", description: `Logged in as ${userData.name}` });
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid credentials", variant: "destructive" });
    }
  };

  const logout = () => {
    setUser(null);
    window.location.href = "/";
  };

  const createUser = async (data: Omit<User, "id">) => {
    try {
      const response = await apiRequest('POST', '/api/users', data);
      const newUser = await response.json();
      await fetchData();
      toast({ title: "Success", description: "Employee created successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create employee", variant: "destructive" });
      throw error;
    }
  };

  const updateUser = async (id: number, data: Partial<User>) => {
    try {
      await apiRequest('PATCH', `/api/users/${id}`, data);
      await fetchData();
      
      if (user?.id === id) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }
      toast({ title: "Profile Updated", description: "Changes saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update user", variant: "destructive" });
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/users/${id}`);
      await fetchData();
      toast({ title: "Success", description: "Employee deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete employee", variant: "destructive" });
    }
  };

  const clockIn = async (lat: number, lng: number, photo: string) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/attendance/clock-in', {
        userId: user.id,
        lat,
        lng,
        photo,
      });
      
      await fetchData();
      
      const dist = getDistanceFromLatLonInKm(lat, lng, config.officeLat, config.officeLng);
      const isWithin = dist <= config.geofenceRadius;
      
      toast({ 
        title: isWithin ? "Clock In Successful" : "Clock In (Outside Geofence)", 
        description: isWithin ? "You are within the office area." : "Warning: You are outside the allowed radius.",
        variant: isWithin ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to clock in", variant: "destructive" });
    }
  };

  const clockOut = async (lat: number, lng: number, photo: string) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/attendance/clock-out', {
        userId: user.id,
        lat,
        lng,
        photo,
      });
      
      await fetchData();
      toast({ title: "Clock Out Successful", description: "See you tomorrow!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to clock out", variant: "destructive" });
    }
  };

  const requestLeave = async (data: Omit<LeaveRequest, "id" | "status" | "userId">) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/leaves', {
        userId: user.id,
        ...data,
        status: 'pending',
      });
      
      await fetchData();
      toast({ title: "Leave Requested", description: "Waiting for approval" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit leave request", variant: "destructive" });
    }
  };

  const approveLeave = async (id: number, status: "approved" | "rejected") => {
    try {
      await apiRequest('POST', `/api/leaves/${id}/approve`, {
        status,
        approvedBy: user?.id,
      });
      
      await fetchData();
      toast({ title: `Leave ${status}`, description: `Request has been ${status}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update leave status", variant: "destructive" });
    }
  };

  const approveAttendance = async (id: number, status: "approved" | "rejected") => {
    try {
      await apiRequest('PATCH', `/api/attendance/${id}`, { approvalStatus: status });
      await fetchData();
      toast({ title: `Attendance ${status}`, description: `Record has been ${status}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update attendance", variant: "destructive" });
    }
  };

  const addPosition = async (position: JobPosition) => {
    try {
      await apiRequest('POST', '/api/positions', position);
      await fetchData();
      toast({ title: "Position Added", description: `${position.title} added successfully.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add position", variant: "destructive" });
    }
  };

  const deletePosition = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/positions/${id}`);
      await fetchData();
      toast({ title: "Position Deleted", description: "Position removed from master data." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete position", variant: "destructive" });
    }
  };

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    try {
      await apiRequest('POST', '/api/config/bulk', newConfig);
      setConfig(prev => ({ ...prev, ...newConfig }));
      toast({ title: "Settings Saved", description: "Configuration updated." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save configuration", variant: "destructive" });
    }
  };

  const generatePayroll = async (period: string) => {
    try {
      const response = await apiRequest('POST', '/api/payroll/generate', { period });
      const result = await response.json();
      await fetchData();
      toast({ title: "Payroll Generated", description: `Created for ${result.payrolls?.length || 0} employees` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate payroll", variant: "destructive" });
    }
  };

  const finalizePayroll = async (id: number) => {
    try {
      await apiRequest('POST', `/api/payroll/${id}/finalize`, {});
      await fetchData();
      toast({ title: "Payroll Finalized", description: "Status updated to Final." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to finalize payroll", variant: "destructive" });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        positions,
        attendance,
        leaves,
        payrolls,
        config,
        isLoading,
        login,
        logout,
        clockIn,
        clockOut,
        requestLeave,
        updateConfig,
        approveAttendance,
        approveLeave,
        addPosition,
        deletePosition,
        generatePayroll,
        updateUser,
        finalizePayroll,
        createUser,
        deleteUser,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

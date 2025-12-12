import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, int, timestamp, decimal, boolean, json, date } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// USERS TABLE - Admin dan Employee
// ============================================
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("employee"),
  positionId: int("position_id"),
  joinDate: date("join_date"),
  avatar: varchar("avatar", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// ACTIVITY LOGS TABLE - Realtime Activity Tracking
// ============================================
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================================
// POSITIONS TABLE - Jabatan dan Rate
// ============================================
export const positions = mysqlTable("positions", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull().unique(),
  hourlyRate: int("hourly_rate").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
});

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

// ============================================
// ATTENDANCE TABLE - Absensi
// ============================================
export const attendance = mysqlTable("attendance", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  date: date("date").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  clockInPhoto: text("clock_in_photo"),
  clockOutPhoto: text("clock_out_photo"),
  clockInLat: decimal("clock_in_lat", { precision: 10, scale: 8 }),
  clockInLng: decimal("clock_in_lng", { precision: 11, scale: 8 }),
  clockOutLat: decimal("clock_out_lat", { precision: 10, scale: 8 }),
  clockOutLng: decimal("clock_out_lng", { precision: 11, scale: 8 }),
  status: varchar("status", { length: 20 }).notNull().default("present"),
  approvalStatus: varchar("approval_status", { length: 20 }).notNull().default("pending"),
  isWithinGeofenceIn: boolean("is_within_geofence_in").default(false),
  isWithinGeofenceOut: boolean("is_within_geofence_out").default(false),
  lateMinutes: int("late_minutes").default(0),
  overtimeMinutes: int("overtime_minutes").default(0),
  workingDurationMinutes: int("working_duration_minutes").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// ============================================
// LEAVES TABLE - Pengajuan Cuti
// ============================================
export const leaves = mysqlTable("leaves", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  attachment: text("attachment"),
  approvedBy: int("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Leave = typeof leaves.$inferSelect;

// ============================================
// PAYROLL TABLE - Penggajian
// ============================================
export const payroll = mysqlTable("payroll", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  period: varchar("period", { length: 7 }).notNull(),
  basicSalary: int("basic_salary").notNull().default(0),
  overtimePay: int("overtime_pay").notNull().default(0),
  bonus: int("bonus").notNull().default(0),
  lateDeduction: int("late_deduction").notNull().default(0),
  bpjsDeduction: int("bpjs_deduction").notNull().default(0),
  pph21Deduction: int("pph21_deduction").notNull().default(0),
  otherDeduction: int("other_deduction").notNull().default(0),
  totalNet: int("total_net").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  generatedAt: timestamp("generated_at").defaultNow(),
  finalizedAt: timestamp("finalized_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
  finalizedAt: true,
});

export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Payroll = typeof payroll.$inferSelect;

// ============================================
// CONFIG TABLE - Konfigurasi Sistem
// ============================================
export const config = mysqlTable("config", {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConfigSchema = createInsertSchema(config).omit({
  id: true,
  updatedAt: true,
});

export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type Config = typeof config.$inferSelect;

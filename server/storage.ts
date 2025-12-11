import { 
  type User, type InsertUser, users,
  type Position, type InsertPosition, positions,
  type Attendance, type InsertAttendance, attendance,
  type Leave, type InsertLeave, leaves,
  type Payroll, type InsertPayroll, payroll,
  type Config, type InsertConfig, config
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Positions
  getPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;

  // Attendance
  getAttendanceRecords(): Promise<Attendance[]>;
  getAttendanceByUser(userId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAttendance(id: number): Promise<Attendance | undefined>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, record: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;

  // Leaves
  getLeaves(): Promise<Leave[]>;
  getLeavesByUser(userId: number): Promise<Leave[]>;
  getLeave(id: number): Promise<Leave | undefined>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: number, leave: Partial<InsertLeave>): Promise<Leave | undefined>;
  deleteLeave(id: number): Promise<boolean>;

  // Payroll
  getPayrolls(): Promise<Payroll[]>;
  getPayrollsByPeriod(period: string): Promise<Payroll[]>;
  getPayrollsByUser(userId: number): Promise<Payroll[]>;
  getPayroll(id: number): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
  deletePayrollsByPeriod(period: string): Promise<boolean>;

  // Config
  getConfigs(): Promise<Config[]>;
  getConfigByKey(key: string): Promise<Config | undefined>;
  setConfig(key: string, value: string, description?: string): Promise<Config>;
  deleteConfig(key: string): Promise<boolean>;
}

export class MySQLStorage implements IStorage {
  // ============================================
  // USERS
  // ============================================
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.name));
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser);
    const insertedId = Number(result[0].insertId);
    const user = await this.getUser(insertedId);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    await db.update(users).set(userData).where(eq(users.id, id));
    return await this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result[0].affectedRows > 0;
  }

  // ============================================
  // POSITIONS
  // ============================================
  async getPositions(): Promise<Position[]> {
    return await db.select().from(positions).orderBy(asc(positions.title));
  }

  async getPosition(id: number): Promise<Position | undefined> {
    const result = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
    return result[0];
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const result = await db.insert(positions).values(insertPosition);
    const insertedId = Number(result[0].insertId);
    const position = await this.getPosition(insertedId);
    if (!position) throw new Error("Failed to create position");
    return position;
  }

  async updatePosition(id: number, positionData: Partial<InsertPosition>): Promise<Position | undefined> {
    await db.update(positions).set(positionData).where(eq(positions.id, id));
    return await this.getPosition(id);
  }

  async deletePosition(id: number): Promise<boolean> {
    const result = await db.delete(positions).where(eq(positions.id, id));
    return result[0].affectedRows > 0;
  }

  // ============================================
  // ATTENDANCE
  // ============================================
  async getAttendanceRecords(): Promise<Attendance[]> {
    return await db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async getAttendanceByUser(userId: number): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(eq(attendance.userId, userId))
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return await db.select().from(attendance)
      .where(sql`DATE(${attendance.date}) = ${date}`)
      .orderBy(desc(attendance.createdAt));
  }

  async getAttendance(id: number): Promise<Attendance | undefined> {
    const result = await db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return result[0];
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const result = await db.insert(attendance).values(insertAttendance);
    const insertedId = Number(result[0].insertId);
    const record = await this.getAttendance(insertedId);
    if (!record) throw new Error("Failed to create attendance record");
    return record;
  }

  async updateAttendance(id: number, attendanceData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    await db.update(attendance).set(attendanceData).where(eq(attendance.id, id));
    return await this.getAttendance(id);
  }

  async deleteAttendance(id: number): Promise<boolean> {
    const result = await db.delete(attendance).where(eq(attendance.id, id));
    return result[0].affectedRows > 0;
  }

  // ============================================
  // LEAVES
  // ============================================
  async getLeaves(): Promise<Leave[]> {
    return await db.select().from(leaves).orderBy(desc(leaves.startDate));
  }

  async getLeavesByUser(userId: number): Promise<Leave[]> {
    return await db.select().from(leaves)
      .where(eq(leaves.userId, userId))
      .orderBy(desc(leaves.startDate));
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    const result = await db.select().from(leaves).where(eq(leaves.id, id)).limit(1);
    return result[0];
  }

  async createLeave(insertLeave: InsertLeave): Promise<Leave> {
    const result = await db.insert(leaves).values(insertLeave);
    const insertedId = Number(result[0].insertId);
    const leave = await this.getLeave(insertedId);
    if (!leave) throw new Error("Failed to create leave request");
    return leave;
  }

  async updateLeave(id: number, leaveData: Partial<InsertLeave>): Promise<Leave | undefined> {
    await db.update(leaves).set(leaveData).where(eq(leaves.id, id));
    return await this.getLeave(id);
  }

  async deleteLeave(id: number): Promise<boolean> {
    const result = await db.delete(leaves).where(eq(leaves.id, id));
    return result[0].affectedRows > 0;
  }

  // ============================================
  // PAYROLL
  // ============================================
  async getPayrolls(): Promise<Payroll[]> {
    return await db.select().from(payroll).orderBy(desc(payroll.period), asc(payroll.userId));
  }

  async getPayrollsByPeriod(period: string): Promise<Payroll[]> {
    return await db.select().from(payroll)
      .where(eq(payroll.period, period))
      .orderBy(asc(payroll.userId));
  }

  async getPayrollsByUser(userId: number): Promise<Payroll[]> {
    return await db.select().from(payroll)
      .where(eq(payroll.userId, userId))
      .orderBy(desc(payroll.period));
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    const result = await db.select().from(payroll).where(eq(payroll.id, id)).limit(1);
    return result[0];
  }

  async createPayroll(insertPayroll: InsertPayroll): Promise<Payroll> {
    const result = await db.insert(payroll).values(insertPayroll);
    const insertedId = Number(result[0].insertId);
    const record = await this.getPayroll(insertedId);
    if (!record) throw new Error("Failed to create payroll record");
    return record;
  }

  async updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    await db.update(payroll).set(payrollData).where(eq(payroll.id, id));
    return await this.getPayroll(id);
  }

  async deletePayroll(id: number): Promise<boolean> {
    const result = await db.delete(payroll).where(eq(payroll.id, id));
    return result[0].affectedRows > 0;
  }

  async deletePayrollsByPeriod(period: string): Promise<boolean> {
    const result = await db.delete(payroll).where(eq(payroll.period, period));
    return result[0].affectedRows >= 0;
  }

  // ============================================
  // CONFIG
  // ============================================
  async getConfigs(): Promise<Config[]> {
    return await db.select().from(config).orderBy(asc(config.key));
  }

  async getConfigByKey(key: string): Promise<Config | undefined> {
    const result = await db.select().from(config).where(eq(config.key, key)).limit(1);
    return result[0];
  }

  async setConfig(key: string, value: string, description?: string): Promise<Config> {
    const existing = await this.getConfigByKey(key);
    if (existing) {
      await db.update(config)
        .set({ value, description, updatedAt: sql`NOW()` })
        .where(eq(config.key, key));
      const updated = await this.getConfigByKey(key);
      return updated!;
    } else {
      const result = await db.insert(config).values({ key, value, description });
      const insertedId = Number(result[0].insertId);
      const record = await db.select().from(config).where(eq(config.id, insertedId)).limit(1);
      return record[0];
    }
  }

  async deleteConfig(key: string): Promise<boolean> {
    const result = await db.delete(config).where(eq(config.key, key));
    return result[0].affectedRows > 0;
  }
}

export const storage = new MySQLStorage();

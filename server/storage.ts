import { 
  type User, type InsertUser, users,
  type Position, type InsertPosition, positions,
  type Attendance, type InsertAttendance, attendance,
  type Leave, type InsertLeave, leaves,
  type Payroll, type InsertPayroll, payroll,
  type Config, type InsertConfig, config,
  type ActivityLog, type InsertActivityLog, activityLogs
} from "@shared/schema";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  getPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<boolean>;

  getAttendanceRecords(): Promise<Attendance[]>;
  getAttendanceByUser(userId: number): Promise<Attendance[]>;
  getAttendanceByDate(date: string): Promise<Attendance[]>;
  getAttendance(id: number): Promise<Attendance | undefined>;
  createAttendance(record: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, record: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  deleteAttendance(id: number): Promise<boolean>;

  getLeaves(): Promise<Leave[]>;
  getLeavesByUser(userId: number): Promise<Leave[]>;
  getLeave(id: number): Promise<Leave | undefined>;
  createLeave(leave: InsertLeave): Promise<Leave>;
  updateLeave(id: number, leave: Partial<InsertLeave>): Promise<Leave | undefined>;
  deleteLeave(id: number): Promise<boolean>;

  getPayrolls(): Promise<Payroll[]>;
  getPayrollsByPeriod(period: string): Promise<Payroll[]>;
  getPayrollsByUser(userId: number): Promise<Payroll[]>;
  getPayroll(id: number): Promise<Payroll | undefined>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, payroll: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
  deletePayrollsByPeriod(period: string): Promise<boolean>;

  getConfigs(): Promise<Config[]>;
  getConfigByKey(key: string): Promise<Config | undefined>;
  setConfig(key: string, value: string, description?: string): Promise<Config>;
  deleteConfig(key: string): Promise<boolean>;

  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
}

// ============================================
// MySQL STORAGE - Primary storage for local MySQL (XAMPP)
// ============================================
export class MySQLStorage implements IStorage {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getUsers(): Promise<User[]> {
    return await this.db.select().from(users).orderBy(asc(users.name));
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser);
    const insertedId = Number(result[0].insertId);
    const user = await this.getUser(insertedId);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    await this.db.update(users).set(userData).where(eq(users.id, id));
    return await this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id));
    return result[0].affectedRows > 0;
  }

  async getPositions(): Promise<Position[]> {
    return await this.db.select().from(positions).orderBy(asc(positions.title));
  }

  async getPosition(id: number): Promise<Position | undefined> {
    const result = await this.db.select().from(positions).where(eq(positions.id, id)).limit(1);
    return result[0];
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const result = await this.db.insert(positions).values(insertPosition);
    const insertedId = Number(result[0].insertId);
    const position = await this.getPosition(insertedId);
    if (!position) throw new Error("Failed to create position");
    return position;
  }

  async updatePosition(id: number, positionData: Partial<InsertPosition>): Promise<Position | undefined> {
    await this.db.update(positions).set(positionData).where(eq(positions.id, id));
    return await this.getPosition(id);
  }

  async deletePosition(id: number): Promise<boolean> {
    const result = await this.db.delete(positions).where(eq(positions.id, id));
    return result[0].affectedRows > 0;
  }

  async getAttendanceRecords(): Promise<Attendance[]> {
    return await this.db.select().from(attendance).orderBy(desc(attendance.date));
  }

  async getAttendanceByUser(userId: number): Promise<Attendance[]> {
    return await this.db.select().from(attendance)
      .where(eq(attendance.userId, userId))
      .orderBy(desc(attendance.date));
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return await this.db.select().from(attendance)
      .where(eq(attendance.date, new Date(date)));
  }

  async getAttendance(id: number): Promise<Attendance | undefined> {
    const result = await this.db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return result[0];
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const result = await this.db.insert(attendance).values(record);
    const insertedId = Number(result[0].insertId);
    const att = await this.getAttendance(insertedId);
    if (!att) throw new Error("Failed to create attendance record");
    return att;
  }

  async updateAttendance(id: number, recordData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    await this.db.update(attendance).set(recordData).where(eq(attendance.id, id));
    return await this.getAttendance(id);
  }

  async deleteAttendance(id: number): Promise<boolean> {
    const result = await this.db.delete(attendance).where(eq(attendance.id, id));
    return result[0].affectedRows > 0;
  }

  async getLeaves(): Promise<Leave[]> {
    return await this.db.select().from(leaves).orderBy(desc(leaves.startDate));
  }

  async getLeavesByUser(userId: number): Promise<Leave[]> {
    return await this.db.select().from(leaves)
      .where(eq(leaves.userId, userId))
      .orderBy(desc(leaves.startDate));
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    const result = await this.db.select().from(leaves).where(eq(leaves.id, id)).limit(1);
    return result[0];
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const result = await this.db.insert(leaves).values(leave);
    const insertedId = Number(result[0].insertId);
    const lv = await this.getLeave(insertedId);
    if (!lv) throw new Error("Failed to create leave request");
    return lv;
  }

  async updateLeave(id: number, leaveData: Partial<InsertLeave>): Promise<Leave | undefined> {
    await this.db.update(leaves).set(leaveData).where(eq(leaves.id, id));
    return await this.getLeave(id);
  }

  async deleteLeave(id: number): Promise<boolean> {
    const result = await this.db.delete(leaves).where(eq(leaves.id, id));
    return result[0].affectedRows > 0;
  }

  async getPayrolls(): Promise<Payroll[]> {
    return await this.db.select().from(payroll).orderBy(desc(payroll.period));
  }

  async getPayrollsByPeriod(period: string): Promise<Payroll[]> {
    return await this.db.select().from(payroll).where(eq(payroll.period, period));
  }

  async getPayrollsByUser(userId: number): Promise<Payroll[]> {
    return await this.db.select().from(payroll)
      .where(eq(payroll.userId, userId))
      .orderBy(desc(payroll.period));
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    const result = await this.db.select().from(payroll).where(eq(payroll.id, id)).limit(1);
    return result[0];
  }

  async createPayroll(payrollData: InsertPayroll): Promise<Payroll> {
    const result = await this.db.insert(payroll).values(payrollData);
    const insertedId = Number(result[0].insertId);
    const pr = await this.getPayroll(insertedId);
    if (!pr) throw new Error("Failed to create payroll record");
    return pr;
  }

  async updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    await this.db.update(payroll).set(payrollData).where(eq(payroll.id, id));
    return await this.getPayroll(id);
  }

  async deletePayroll(id: number): Promise<boolean> {
    const result = await this.db.delete(payroll).where(eq(payroll.id, id));
    return result[0].affectedRows > 0;
  }

  async deletePayrollsByPeriod(period: string): Promise<boolean> {
    const result = await this.db.delete(payroll).where(eq(payroll.period, period));
    return result[0].affectedRows > 0;
  }

  async getConfigs(): Promise<Config[]> {
    return await this.db.select().from(config);
  }

  async getConfigByKey(key: string): Promise<Config | undefined> {
    const result = await this.db.select().from(config).where(eq(config.key, key)).limit(1);
    return result[0];
  }

  async setConfig(key: string, value: string, description?: string): Promise<Config> {
    const existing = await this.getConfigByKey(key);
    if (existing) {
      await this.db.update(config).set({ value, description }).where(eq(config.key, key));
      const updated = await this.getConfigByKey(key);
      return updated!;
    }
    const result = await this.db.insert(config).values({ key, value, description });
    const insertedId = Number(result[0].insertId);
    const cfg = await this.db.select().from(config).where(eq(config.id, insertedId)).limit(1);
    return cfg[0];
  }

  async deleteConfig(key: string): Promise<boolean> {
    const result = await this.db.delete(config).where(eq(config.key, key));
    return result[0].affectedRows > 0;
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return await this.db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const result = await this.db.insert(activityLogs).values(log);
    const insertedId = Number(result[0].insertId);
    const logs = await this.db.select().from(activityLogs).where(eq(activityLogs.id, insertedId)).limit(1);
    return logs[0];
  }
}

// ============================================
// IN-MEMORY STORAGE - Fallback for demo/development
// ============================================
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private positions: Map<number, Position> = new Map();
  private attendance: Map<number, Attendance> = new Map();
  private leaves: Map<number, Leave> = new Map();
  private payrolls: Map<number, Payroll> = new Map();
  private configs: Map<string, Config> = new Map();
  private activityLogsStore: Map<number, ActivityLog> = new Map();
  
  private nextUserId = 1;
  private nextPositionId = 1;
  private nextAttendanceId = 1;
  private nextLeaveId = 1;
  private nextPayrollId = 1;
  private nextConfigId = 1;
  private nextActivityLogId = 1;

  constructor() {
    this.initDummyData();
  }

  private initDummyData() {
    const positionsData: InsertPosition[] = [
      { title: 'Kepala Proyek Manajer', hourlyRate: 75000, description: 'Manajer proyek konstruksi senior' },
      { title: 'Manajer', hourlyRate: 60000, description: 'Manajer divisi' },
      { title: 'Arsitek', hourlyRate: 60000, description: 'Desain dan perencanaan bangunan' },
      { title: 'Wakil Kepala Proyek', hourlyRate: 50000, description: 'Asisten kepala proyek' },
      { title: 'Kepala Pengawasan', hourlyRate: 45000, description: 'Kepala tim pengawasan lapangan' },
      { title: 'Staff Pengawasan', hourlyRate: 35000, description: 'Staff pengawasan lapangan' },
      { title: 'CMO', hourlyRate: 50000, description: 'Chief Marketing Officer' },
      { title: 'Admin', hourlyRate: 30000, description: 'Staff administrasi' },
      { title: 'Staff Marketing', hourlyRate: 30000, description: 'Staff pemasaran' },
      { title: 'OB', hourlyRate: 12000, description: 'Office Boy' },
    ];

    positionsData.forEach(p => {
      const id = this.nextPositionId++;
      this.positions.set(id, { ...p, id } as Position);
    });

    const usersData: Omit<User, 'id'>[] = [
      { name: 'Administrator', email: 'admin@panca.test', password: 'password', role: 'admin', positionId: 8, joinDate: '2020-01-01', phone: '081234567890', address: 'Jl. Admin No. 1, Palembang', status: 'active' },
      { name: 'Budi Santoso', email: 'budi@panca.test', password: 'password', role: 'employee', positionId: 1, joinDate: '2021-03-15', phone: '081234567891', address: 'Jl. Merdeka No. 10, Palembang', status: 'active' },
      { name: 'Siti Aminah', email: 'siti@panca.test', password: 'password', role: 'employee', positionId: 3, joinDate: '2022-06-10', phone: '081234567892', address: 'Jl. Pahlawan No. 25, Palembang', status: 'active' },
      { name: 'Rudi Hartono', email: 'rudi@panca.test', password: 'password', role: 'employee', positionId: 6, joinDate: '2023-01-20', phone: '081234567893', address: 'Jl. Sudirman No. 50, Palembang', status: 'active' },
      { name: 'Dewi Lestari', email: 'dewi@panca.test', password: 'password', role: 'employee', positionId: 9, joinDate: '2023-05-05', phone: '081234567894', address: 'Jl. Gatot Subroto No. 15, Palembang', status: 'active' },
      { name: 'Joko Anwar', email: 'joko@panca.test', password: 'password', role: 'employee', positionId: 10, joinDate: '2023-11-01', phone: '081234567895', address: 'Jl. Ahmad Yani No. 30, Palembang', status: 'active' },
      { name: 'Andi Wijaya', email: 'andi@panca.test', password: 'password', role: 'employee', positionId: 2, joinDate: '2020-06-15', phone: '081234567896', address: 'Jl. Diponegoro No. 42, Palembang', status: 'active' },
      { name: 'Rina Kusuma', email: 'rina@panca.test', password: 'password', role: 'employee', positionId: 4, joinDate: '2021-09-01', phone: '081234567897', address: 'Jl. Kartini No. 18, Palembang', status: 'active' },
      { name: 'Hendra Pratama', email: 'hendra@panca.test', password: 'password', role: 'employee', positionId: 5, joinDate: '2022-02-20', phone: '081234567898', address: 'Jl. Veteran No. 55, Palembang', status: 'active' },
      { name: 'Maya Sari', email: 'maya@panca.test', password: 'password', role: 'employee', positionId: 7, joinDate: '2022-08-10', phone: '081234567899', address: 'Jl. Jendral Ahmad Yani No. 77, Palembang', status: 'active' },
      { name: 'Bambang Susilo', email: 'bambang@panca.test', password: 'password', role: 'employee', positionId: 6, joinDate: '2023-03-01', phone: '081234567800', address: 'Jl. Kolonel Atmo No. 99, Palembang', status: 'active' },
    ];

    usersData.forEach(u => {
      const id = this.nextUserId++;
      this.users.set(id, { ...u, id } as User);
    });

    // Generate attendance for Oct, Nov, Dec 2025
    const periods = [
      { year: 2025, month: 10, days: 31 }, // October
      { year: 2025, month: 11, days: 30 }, // November
      { year: 2025, month: 12, days: 31 }, // December
    ];

    for (const period of periods) {
      for (let day = 1; day <= period.days; day++) {
        const date = new Date(period.year, period.month - 1, day);
        const dayOfWeek = date.getDay();
        
        // Skip weekends (0=Sunday, 6=Saturday)
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        const dateStr = date.toISOString().split('T')[0];
        
        for (let userId = 2; userId <= 11; userId++) {
          // Random clock-in between 08:00 and 08:20
          const clockInMinutes = Math.floor(Math.random() * 21); // 0-20 minutes
          // Random clock-out between 17:00 and 17:10
          const clockOutMinutes = Math.floor(Math.random() * 11); // 0-10 minutes
          
          // Calculate late minutes (threshold is 10 minutes after 08:00)
          const lateMinutes = clockInMinutes > 10 ? clockInMinutes - 10 : 0;
          const status = lateMinutes > 0 ? 'late' : 'present';
          
          // Overtime is minutes after 17:00
          const overtimeMinutes = clockOutMinutes;
          
          // Working duration = (9 hours + overtime - late) - 60 min break
          const workingDurationMinutes = (9 * 60) + clockOutMinutes - clockInMinutes - 60;
          
          const id = this.nextAttendanceId++;
          this.attendance.set(id, {
            id,
            userId,
            date: new Date(dateStr),
            clockIn: new Date(`${dateStr}T08:${String(clockInMinutes).padStart(2, '0')}:00`),
            clockOut: new Date(`${dateStr}T17:${String(clockOutMinutes).padStart(2, '0')}:00`),
            status,
            approvalStatus: 'approved',
            isWithinGeofenceIn: true,
            isWithinGeofenceOut: true,
            lateMinutes,
            overtimeMinutes,
            workingDurationMinutes,
            clockInLat: '-2.9795731113284303',
            clockInLng: '104.73111003716011',
            clockOutLat: '-2.9795731113284303',
            clockOutLng: '104.73111003716011',
          } as Attendance);
        }
      }
    }

    const leavesData = [
      // Oktober 2025
      { userId: 3, type: 'annual', startDate: '2025-10-06', endDate: '2025-10-07', reason: 'Urusan keluarga di luar kota', status: 'approved', approvedBy: 1 },
      { userId: 5, type: 'sick', startDate: '2025-10-15', endDate: '2025-10-16', reason: 'Sakit flu dan demam', status: 'approved', approvedBy: 1 },
      { userId: 8, type: 'other', startDate: '2025-10-20', endDate: '2025-10-20', reason: 'Menghadiri wisuda saudara', status: 'approved', approvedBy: 1 },
      // November 2025
      { userId: 2, type: 'annual', startDate: '2025-11-03', endDate: '2025-11-05', reason: 'Cuti tahunan - liburan keluarga', status: 'approved', approvedBy: 1 },
      { userId: 4, type: 'sick', startDate: '2025-11-12', endDate: '2025-11-13', reason: 'Sakit gigi dan perlu perawatan', status: 'approved', approvedBy: 1 },
      { userId: 7, type: 'annual', startDate: '2025-11-24', endDate: '2025-11-26', reason: 'Cuti acara pernikahan keluarga', status: 'approved', approvedBy: 1 },
      { userId: 9, type: 'other', startDate: '2025-11-28', endDate: '2025-11-28', reason: 'Mengurus dokumen penting', status: 'approved', approvedBy: 1 },
      // Desember 2025
      { userId: 3, type: 'annual', startDate: '2025-12-08', endDate: '2025-12-10', reason: 'Liburan akhir tahun', status: 'approved', approvedBy: 1 },
      { userId: 6, type: 'annual', startDate: '2025-12-15', endDate: '2025-12-17', reason: 'Mudik akhir tahun', status: 'approved', approvedBy: 1 },
      { userId: 10, type: 'annual', startDate: '2025-12-22', endDate: '2025-12-26', reason: 'Cuti natal dan tahun baru', status: 'approved', approvedBy: 1 },
      { userId: 11, type: 'annual', startDate: '2025-12-29', endDate: '2025-12-31', reason: 'Cuti akhir tahun', status: 'pending' },
      { userId: 5, type: 'other', startDate: '2025-12-24', endDate: '2025-12-24', reason: 'Menghadiri acara gereja', status: 'pending' },
    ];

    leavesData.forEach(l => {
      const id = this.nextLeaveId++;
      this.leaves.set(id, { 
        ...l, 
        id,
        startDate: new Date(l.startDate),
        endDate: new Date(l.endDate),
      } as Leave);
    });

    // Generate payroll for Oct, Nov, Dec 2025 based on attendance data
    const payrollPeriods = ['2025-10', '2025-11', '2025-12'];
    const latePenaltyPerMinute = 2000;
    const bpjsRate = 0.03;
    const pph21Rate = 0.05;
    const overtimeRateFirst = 1.5;
    const overtimeRateNext = 2.0;

    for (const periodStr of payrollPeriods) {
      for (let userId = 2; userId <= 11; userId++) {
        const position = this.positions.get(this.users.get(userId)?.positionId || 1);
        const hourlyRate = position?.hourlyRate || 30000;
        
        // Calculate totals from attendance for this period
        const attendanceRecords = Array.from(this.attendance.values())
          .filter(a => {
            const aDate = a.date instanceof Date ? a.date : new Date(a.date);
            const recordPeriod = `${aDate.getFullYear()}-${String(aDate.getMonth() + 1).padStart(2, '0')}`;
            return a.userId === userId && recordPeriod === periodStr && a.approvalStatus === 'approved';
          });
        
        let totalWorkMinutes = 0;
        let totalLateMinutes = 0;
        let totalOvertimeMinutes = 0;
        
        for (const att of attendanceRecords) {
          totalWorkMinutes += (att as any).workingDurationMinutes || 480;
          totalLateMinutes += att.lateMinutes || 0;
          totalOvertimeMinutes += att.overtimeMinutes || 0;
        }
        
        const workHours = totalWorkMinutes / 60;
        const basicSalary = Math.floor(workHours * hourlyRate);
        
        // Calculate overtime pay
        let overtimePay = 0;
        if (totalOvertimeMinutes > 0) {
          if (totalOvertimeMinutes <= 60) {
            overtimePay = Math.floor((totalOvertimeMinutes / 60) * hourlyRate * overtimeRateFirst);
          } else {
            overtimePay = Math.floor((1 * hourlyRate * overtimeRateFirst) + 
                                    ((totalOvertimeMinutes - 60) / 60) * hourlyRate * overtimeRateNext);
          }
        }
        
        const lateDeduction = totalLateMinutes * latePenaltyPerMinute;
        const bpjsDeduction = Math.floor(basicSalary * bpjsRate);
        const pph21Deduction = Math.floor(basicSalary * pph21Rate);
        const totalNet = basicSalary + overtimePay - lateDeduction - bpjsDeduction - pph21Deduction;

        const id = this.nextPayrollId++;
        this.payrolls.set(id, {
          id,
          userId,
          period: periodStr,
          basicSalary,
          overtimePay,
          bonus: 0,
          lateDeduction,
          bpjsDeduction,
          pph21Deduction,
          otherDeduction: 0,
          totalNet,
          status: 'final',
          generatedAt: new Date(),
          finalizedAt: new Date(),
        } as Payroll);
      }
    }

    const configData = [
      // Company Info
      { key: 'companyName', value: 'PT Panca Karya Utama', description: 'Nama perusahaan' },
      { key: 'companyAddress', value: 'Jl. Konstruksi No. 123, Palembang, Sumatera Selatan', description: 'Alamat perusahaan' },
      { key: 'companyPhone', value: '+62 711 123456', description: 'Telepon perusahaan' },
      { key: 'companyEmail', value: 'info@pancakaryautama.co.id', description: 'Email perusahaan' },
      { key: 'companyWebsite', value: 'www.pancakaryautama.co.id', description: 'Website perusahaan' },
      { key: 'vision', value: 'Menjadi perusahaan konstruksi terkemuka dan terpercaya di Indonesia yang mengutamakan kualitas, inovasi, dan kepuasan pelanggan.', description: 'Visi perusahaan' },
      { key: 'mission', value: 'Memberikan layanan konstruksi berkualitas tinggi dengan mengutamakan keselamatan kerja, ketepatan waktu, dan efisiensi biaya.', description: 'Misi perusahaan' },
      { key: 'history', value: 'PT Panca Karya Utama didirikan pada tahun 2010 di Palembang. Berawal dari sebuah kontraktor kecil, perusahaan telah berkembang menjadi salah satu kontraktor terkemuka di Sumatera Selatan dengan berbagai proyek besar di bidang konstruksi sipil, gedung, dan infrastruktur.', description: 'Sejarah perusahaan' },
      // Geofence Settings
      { key: 'officeLat', value: '-2.9795731113284303', description: 'Latitude kantor untuk geofence' },
      { key: 'officeLng', value: '104.73111003716011', description: 'Longitude kantor untuk geofence' },
      { key: 'geofenceRadius', value: '100', description: 'Radius geofence dalam meter' },
      // Work Schedule Settings
      { key: 'work_start_time', value: '08:00', description: 'Jam mulai kerja (HH:MM)' },
      { key: 'work_end_time', value: '17:00', description: 'Jam selesai kerja (HH:MM)' },
      { key: 'late_tolerance_minutes', value: '10', description: 'Toleransi keterlambatan dalam menit' },
      { key: 'break_duration_minutes', value: '60', description: 'Durasi istirahat dalam menit' },
      // Overtime Rates
      { key: 'overtime_rate_first_hour', value: '1.5', description: 'Multiplier lembur jam pertama' },
      { key: 'overtime_rate_next_hours', value: '2.0', description: 'Multiplier lembur jam berikutnya' },
      // Deduction Rates
      { key: 'late_penalty_per_minute', value: '2000', description: 'Potongan keterlambatan per menit (Rupiah)' },
      { key: 'bpjs_kesehatan_rate', value: '0.01', description: 'Rate BPJS Kesehatan (1%)' },
      { key: 'bpjs_ketenagakerjaan_rate', value: '0.02', description: 'Rate BPJS Ketenagakerjaan JHT (2%)' },
      { key: 'pph21_rate', value: '0.05', description: 'Rate PPh 21 (5%)' },
    ];

    configData.forEach(c => {
      const id = this.nextConfigId++;
      this.configs.set(c.key, { ...c, id } as Config);
    });
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const newUser = { ...user, id } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values()).sort((a, b) => a.title.localeCompare(b.title));
  }

  async getPosition(id: number): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(position: InsertPosition): Promise<Position> {
    const id = this.nextPositionId++;
    const newPosition = { ...position, id } as Position;
    this.positions.set(id, newPosition);
    return newPosition;
  }

  async updatePosition(id: number, positionData: Partial<InsertPosition>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;
    const updated = { ...position, ...positionData };
    this.positions.set(id, updated);
    return updated;
  }

  async deletePosition(id: number): Promise<boolean> {
    return this.positions.delete(id);
  }

  async getAttendanceRecords(): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getAttendanceByUser(userId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getAttendanceByDate(date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(a => {
        const aDate = a.date instanceof Date ? a.date.toISOString().split('T')[0] : String(a.date).split('T')[0];
        return aDate === date;
      });
  }

  async getAttendance(id: number): Promise<Attendance | undefined> {
    return this.attendance.get(id);
  }

  async createAttendance(record: InsertAttendance): Promise<Attendance> {
    const id = this.nextAttendanceId++;
    const newRecord = { ...record, id } as Attendance;
    this.attendance.set(id, newRecord);
    return newRecord;
  }

  async updateAttendance(id: number, recordData: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const record = this.attendance.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...recordData };
    this.attendance.set(id, updated);
    return updated;
  }

  async deleteAttendance(id: number): Promise<boolean> {
    return this.attendance.delete(id);
  }

  async getLeaves(): Promise<Leave[]> {
    return Array.from(this.leaves.values()).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getLeavesByUser(userId: number): Promise<Leave[]> {
    return Array.from(this.leaves.values())
      .filter(l => l.userId === userId)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }

  async getLeave(id: number): Promise<Leave | undefined> {
    return this.leaves.get(id);
  }

  async createLeave(leave: InsertLeave): Promise<Leave> {
    const id = this.nextLeaveId++;
    const newLeave = { ...leave, id } as Leave;
    this.leaves.set(id, newLeave);
    return newLeave;
  }

  async updateLeave(id: number, leaveData: Partial<InsertLeave>): Promise<Leave | undefined> {
    const leave = this.leaves.get(id);
    if (!leave) return undefined;
    const updated = { ...leave, ...leaveData };
    this.leaves.set(id, updated);
    return updated;
  }

  async deleteLeave(id: number): Promise<boolean> {
    return this.leaves.delete(id);
  }

  async getPayrolls(): Promise<Payroll[]> {
    return Array.from(this.payrolls.values()).sort((a, b) => 
      b.period.localeCompare(a.period)
    );
  }

  async getPayrollsByPeriod(period: string): Promise<Payroll[]> {
    return Array.from(this.payrolls.values()).filter(p => p.period === period);
  }

  async getPayrollsByUser(userId: number): Promise<Payroll[]> {
    return Array.from(this.payrolls.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.period.localeCompare(a.period));
  }

  async getPayroll(id: number): Promise<Payroll | undefined> {
    return this.payrolls.get(id);
  }

  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const id = this.nextPayrollId++;
    const newPayroll = { ...payroll, id, generatedAt: new Date() } as Payroll;
    this.payrolls.set(id, newPayroll);
    return newPayroll;
  }

  async updatePayroll(id: number, payrollData: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const payroll = this.payrolls.get(id);
    if (!payroll) return undefined;
    const updated = { ...payroll, ...payrollData };
    this.payrolls.set(id, updated);
    return updated;
  }

  async deletePayroll(id: number): Promise<boolean> {
    return this.payrolls.delete(id);
  }

  async deletePayrollsByPeriod(period: string): Promise<boolean> {
    const toDelete = Array.from(this.payrolls.values()).filter(p => p.period === period);
    toDelete.forEach(p => this.payrolls.delete(p.id));
    return toDelete.length > 0;
  }

  async getConfigs(): Promise<Config[]> {
    return Array.from(this.configs.values());
  }

  async getConfigByKey(key: string): Promise<Config | undefined> {
    return this.configs.get(key);
  }

  async setConfig(key: string, value: string, description?: string): Promise<Config> {
    const existing = this.configs.get(key);
    if (existing) {
      const updated = { ...existing, value, description: description || existing.description };
      this.configs.set(key, updated);
      return updated;
    }
    const id = this.nextConfigId++;
    const newConfig = { id, key, value, description } as Config;
    this.configs.set(key, newConfig);
    return newConfig;
  }

  async deleteConfig(key: string): Promise<boolean> {
    return this.configs.delete(key);
  }

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return Array.from(this.activityLogsStore.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = this.nextActivityLogId++;
    const newLog = { ...log, id, createdAt: new Date() } as ActivityLog;
    this.activityLogsStore.set(id, newLog);
    return newLog;
  }
}

// ============================================
// STORAGE INITIALIZATION
// ============================================
// Try MySQL first, fallback to in-memory if MySQL not available
let storage: IStorage;

async function initStorage(): Promise<IStorage> {
  const useMemory = process.env.USE_MEMORY_STORAGE === 'true';
  
  if (useMemory) {
    console.log('[storage] Using in-memory storage (USE_MEMORY_STORAGE=true)');
    return new MemStorage();
  }

  try {
    const { db } = await import('./db');
    const mysqlStorage = new MySQLStorage(db);
    await mysqlStorage.getConfigs();
    console.log('[storage] Connected to MySQL database');
    return mysqlStorage;
  } catch (error: any) {
    console.log('[storage] MySQL connection failed:', error.message);
    console.log('[storage] Falling back to in-memory storage with demo data');
    return new MemStorage();
  }
}

storage = new MemStorage();

initStorage().then(s => {
  storage = s;
}).catch(() => {
  console.log('[storage] Using in-memory storage as fallback');
});

export { storage };

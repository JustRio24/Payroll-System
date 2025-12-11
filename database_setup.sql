-- ============================================
-- SQL Script untuk Database db_payroll
-- Database: MySQL (untuk XAMPP/phpMyAdmin)
-- PT Panca Karya Utama - Payroll & HRIS System
-- ============================================

-- Buat database (jika belum ada)
CREATE DATABASE IF NOT EXISTS db_payroll
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Gunakan database
USE db_payroll;

-- ============================================
-- DROP TABLES (untuk reset jika perlu)
-- ============================================
DROP TABLE IF EXISTS payroll;
DROP TABLE IF EXISTS leaves;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS config;

-- ============================================
-- Tabel: positions
-- Deskripsi: Master data jabatan dan rate per jam
-- ============================================
CREATE TABLE positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL UNIQUE,
  hourly_rate INT NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: users
-- Deskripsi: Data pengguna (admin & karyawan)
-- ============================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  position_id INT,
  join_date DATE,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: attendance
-- Deskripsi: Data absensi karyawan
-- ============================================
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMP NULL,
  clock_out TIMESTAMP NULL,
  clock_in_photo TEXT,
  clock_out_photo TEXT,
  clock_in_lat DECIMAL(10, 8),
  clock_in_lng DECIMAL(11, 8),
  clock_out_lat DECIMAL(10, 8),
  clock_out_lng DECIMAL(11, 8),
  status VARCHAR(20) NOT NULL DEFAULT 'present',
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_within_geofence_in BOOLEAN DEFAULT FALSE,
  is_within_geofence_out BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: leaves
-- Deskripsi: Pengajuan cuti karyawan
-- ============================================
CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attachment TEXT,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: payroll
-- Deskripsi: Data penggajian
-- ============================================
CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  period VARCHAR(7) NOT NULL,
  basic_salary INT NOT NULL DEFAULT 0,
  overtime_pay INT NOT NULL DEFAULT 0,
  bonus INT NOT NULL DEFAULT 0,
  late_deduction INT NOT NULL DEFAULT 0,
  bpjs_deduction INT NOT NULL DEFAULT 0,
  pph21_deduction INT NOT NULL DEFAULT 0,
  other_deduction INT NOT NULL DEFAULT 0,
  total_net INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalized_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_period (period),
  INDEX idx_status (status),
  UNIQUE KEY unique_user_period (user_id, period),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: config
-- Deskripsi: Konfigurasi sistem
-- ============================================
CREATE TABLE config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATA DUMMY: Positions (Jabatan)
-- ============================================
INSERT INTO positions (title, hourly_rate, description) VALUES
('Kepala Proyek Manajer', 75000, 'Manajer proyek konstruksi senior'),
('Manajer', 60000, 'Manajer divisi'),
('Arsitek', 60000, 'Desain dan perencanaan bangunan'),
('Wakil Kepala Proyek', 50000, 'Asisten kepala proyek'),
('Kepala Pengawasan', 45000, 'Kepala tim pengawasan lapangan'),
('Staff Pengawasan', 35000, 'Staff pengawasan lapangan'),
('CMO', 50000, 'Chief Marketing Officer'),
('Admin', 30000, 'Staff administrasi'),
('Staff Marketing', 30000, 'Staff pemasaran'),
('OB', 12000, 'Office Boy');

-- ============================================
-- DATA DUMMY: Users (Pengguna)
-- ============================================
INSERT INTO users (name, email, password, role, position_id, join_date, phone, address, status) VALUES
-- Admin
('Administrator', 'admin@panca.test', 'password', 'admin', 8, '2020-01-01', '081234567890', 'Jl. Admin No. 1, Palembang', 'active'),

-- Employees
('Budi Santoso', 'budi@panca.test', 'password', 'employee', 1, '2021-03-15', '081234567891', 'Jl. Merdeka No. 10, Palembang', 'active'),
('Siti Aminah', 'siti@panca.test', 'password', 'employee', 3, '2022-06-10', '081234567892', 'Jl. Pahlawan No. 25, Palembang', 'active'),
('Rudi Hartono', 'rudi@panca.test', 'password', 'employee', 6, '2023-01-20', '081234567893', 'Jl. Sudirman No. 50, Palembang', 'active'),
('Dewi Lestari', 'dewi@panca.test', 'password', 'employee', 9, '2023-05-05', '081234567894', 'Jl. Gatot Subroto No. 15, Palembang', 'active'),
('Joko Anwar', 'joko@panca.test', 'password', 'employee', 10, '2023-11-01', '081234567895', 'Jl. Ahmad Yani No. 30, Palembang', 'active'),
('Andi Wijaya', 'andi@panca.test', 'password', 'employee', 2, '2020-06-15', '081234567896', 'Jl. Diponegoro No. 42, Palembang', 'active'),
('Rina Kusuma', 'rina@panca.test', 'password', 'employee', 4, '2021-09-01', '081234567897', 'Jl. Kartini No. 18, Palembang', 'active'),
('Hendra Pratama', 'hendra@panca.test', 'password', 'employee', 5, '2022-02-20', '081234567898', 'Jl. Veteran No. 55, Palembang', 'active'),
('Maya Sari', 'maya@panca.test', 'password', 'employee', 7, '2022-08-10', '081234567899', 'Jl. Jendral Ahmad Yani No. 77, Palembang', 'active'),
('Bambang Susilo', 'bambang@panca.test', 'password', 'employee', 6, '2023-03-01', '081234567800', 'Jl. Kolonel Atmo No. 99, Palembang', 'active');

-- ============================================
-- DATA DUMMY: Attendance (Absensi) - 30 hari terakhir
-- ============================================
-- Generate attendance for each employee for the last 30 days (excluding weekends)
INSERT INTO attendance (user_id, date, clock_in, clock_out, status, approval_status, is_within_geofence_in, is_within_geofence_out) VALUES
-- Budi Santoso (user_id = 2)
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Siti Aminah (user_id = 3)
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR + INTERVAL 15 MINUTE, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'late', 'approved', TRUE, TRUE),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 1 HOUR, 'present', 'approved', TRUE, TRUE),
(3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Rudi Hartono (user_id = 4)
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR, 'present', 'approved', TRUE, TRUE),
(4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR + INTERVAL 30 MINUTE, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'late', 'approved', TRUE, TRUE),
(4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'pending', TRUE, TRUE),
(4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Dewi Lestari (user_id = 5)
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'pending', TRUE, TRUE),
(5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(5, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Joko Anwar (user_id = 6)
(6, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(6, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', FALSE, TRUE),
(6, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(6, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(6, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Andi Wijaya (user_id = 7)
(7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 'present', 'approved', TRUE, TRUE),
(7, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(7, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(7, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'pending', TRUE, TRUE),
(7, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Rina Kusuma (user_id = 8)
(8, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(8, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(8, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(8, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(8, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Hendra Pratama (user_id = 9)
(9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR + INTERVAL 20 MINUTE, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'late', 'approved', TRUE, TRUE),
(9, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(9, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(9, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Maya Sari (user_id = 10)
(10, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(10, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(10, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(10, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(10, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),

-- Bambang Susilo (user_id = 11)
(11, DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 0 HOUR, 'present', 'pending', TRUE, TRUE),
(11, DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(11, DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(11, DATE_SUB(CURDATE(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE),
(11, DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) - INTERVAL 9 HOUR, DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 0 HOUR, 'present', 'approved', TRUE, TRUE);

-- ============================================
-- DATA DUMMY: Leaves (Pengajuan Cuti)
-- ============================================
INSERT INTO leaves (user_id, type, start_date, end_date, reason, status, approved_by, approved_at) VALUES
(3, 'annual', DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'Liburan keluarga', 'approved', 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(4, 'sick', DATE_SUB(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Demam dan flu', 'approved', 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 'annual', DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Acara pernikahan saudara', 'pending', NULL, NULL),
(7, 'other', DATE_SUB(CURDATE(), INTERVAL 3 DAY), DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'Mengurus dokumen penting', 'approved', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(8, 'annual', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'Cuti tahunan - mudik', 'pending', NULL, NULL),
(9, 'sick', DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_SUB(CURDATE(), INTERVAL 14 DAY), 'Sakit gigi', 'approved', 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(10, 'other', DATE_ADD(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Wisuda anak', 'pending', NULL, NULL),
(2, 'annual', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'Cuti tahunan', 'approved', 1, DATE_SUB(NOW(), INTERVAL 35 DAY));

-- ============================================
-- DATA DUMMY: Payroll (Penggajian) - Bulan lalu
-- ============================================
SET @last_month = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m');

INSERT INTO payroll (user_id, period, basic_salary, overtime_pay, bonus, late_deduction, bpjs_deduction, pph21_deduction, other_deduction, total_net, status, finalized_at) VALUES
(2, @last_month, 12975000, 562500, 0, 0, 389250, 648750, 0, 12499500, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, @last_month, 10380000, 225000, 0, 30000, 311400, 519000, 0, 9744600, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, @last_month, 6055000, 105000, 0, 60000, 181650, 302750, 0, 5615600, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, @last_month, 5190000, 0, 0, 0, 155700, 259500, 0, 4774800, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, @last_month, 2076000, 36000, 0, 0, 62280, 103800, 0, 1945920, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, @last_month, 10380000, 300000, 500000, 0, 311400, 519000, 0, 10349600, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(8, @last_month, 8650000, 187500, 0, 0, 259500, 432500, 0, 8145500, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(9, @last_month, 7785000, 168750, 0, 40000, 233550, 389250, 0, 7290950, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, @last_month, 8650000, 250000, 0, 0, 259500, 432500, 0, 8208000, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(11, @last_month, 6055000, 0, 0, 0, 181650, 302750, 0, 5570600, 'final', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================
-- DATA DUMMY: Config (Konfigurasi Sistem)
-- ============================================
INSERT INTO config (`key`, value, description) VALUES
('companyName', 'PT Panca Karya Utama', 'Nama perusahaan'),
('companyAddress', 'Jl. Konstruksi No. 123, Palembang, Sumatera Selatan', 'Alamat perusahaan'),
('officeLat', '-2.9795731113284303', 'Latitude kantor untuk geofence'),
('officeLng', '104.73111003716011', 'Longitude kantor untuk geofence'),
('geofenceRadius', '100', 'Radius geofence dalam meter'),
('latePenaltyPerMinute', '2000', 'Potongan keterlambatan per menit (Rupiah)'),
('breakDurationMinutes', '60', 'Durasi istirahat dalam menit'),
('bpjsKesehatanRate', '0.01', 'Rate BPJS Kesehatan (1%)'),
('bpjsKetenagakerjaanRate', '0.02', 'Rate BPJS Ketenagakerjaan JHT (2%)'),
('vision', 'Menjadi perusahaan konstruksi terkemuka dan terpercaya di Indonesia yang mengutamakan kualitas, inovasi, dan kepuasan pelanggan.', 'Visi perusahaan'),
('mission', 'Memberikan layanan konstruksi berkualitas tinggi dengan mengutamakan keselamatan kerja, ketepatan waktu, dan efisiensi biaya.', 'Misi perusahaan'),
('history', 'PT Panca Karya Utama didirikan pada tahun 2010 di Palembang. Berawal dari sebuah kontraktor kecil, perusahaan telah berkembang menjadi salah satu kontraktor terkemuka di Sumatera Selatan dengan berbagai proyek besar di bidang konstruksi sipil, gedung, dan infrastruktur.', 'Sejarah perusahaan');

-- ============================================
-- Verifikasi data
-- ============================================
SELECT 'Tabel positions:' AS 'Info';
SELECT COUNT(*) AS total_positions FROM positions;

SELECT 'Tabel users:' AS 'Info';
SELECT COUNT(*) AS total_users FROM users;

SELECT 'Tabel attendance:' AS 'Info';
SELECT COUNT(*) AS total_attendance FROM attendance;

SELECT 'Tabel leaves:' AS 'Info';
SELECT COUNT(*) AS total_leaves FROM leaves;

SELECT 'Tabel payroll:' AS 'Info';
SELECT COUNT(*) AS total_payroll FROM payroll;

SELECT 'Tabel config:' AS 'Info';
SELECT COUNT(*) AS total_config FROM config;

SELECT 'Setup database selesai!' AS 'Status';

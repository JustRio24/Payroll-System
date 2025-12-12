-- ============================================
-- SQL Script untuk Database db_payroll
-- Database: MySQL (untuk XAMPP/phpMyAdmin)
-- PT Panca Karya Utama - Payroll & HRIS System
-- Data Periode: Oktober, November, Desember 2025
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
DROP TABLE IF EXISTS activity_logs;
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
  late_minutes INT DEFAULT 0,
  overtime_minutes INT DEFAULT 0,
  working_duration_minutes INT DEFAULT 0,
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
-- Tabel: activity_logs
-- Deskripsi: Log aktivitas pengguna untuk tracking realtime
-- ============================================
CREATE TABLE activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
-- DATA DUMMY: Config (Konfigurasi Sistem)
-- ============================================
INSERT INTO config (`key`, value, description) VALUES
-- Company Info
('companyName', 'PT Panca Karya Utama', 'Nama perusahaan'),
('companyAddress', 'Jl. Konstruksi No. 123, Palembang, Sumatera Selatan', 'Alamat perusahaan'),
('companyPhone', '+62 711 123456', 'Telepon perusahaan'),
('companyEmail', 'info@pancakaryautama.co.id', 'Email perusahaan'),
('companyWebsite', 'www.pancakaryautama.co.id', 'Website perusahaan'),
('vision', 'Menjadi perusahaan konstruksi terkemuka dan terpercaya di Indonesia yang mengutamakan kualitas, inovasi, dan kepuasan pelanggan.', 'Visi perusahaan'),
('mission', 'Memberikan layanan konstruksi berkualitas tinggi dengan mengutamakan keselamatan kerja, ketepatan waktu, dan efisiensi biaya.', 'Misi perusahaan'),
('history', 'PT Panca Karya Utama didirikan pada tahun 2010 di Palembang. Berawal dari sebuah kontraktor kecil, perusahaan telah berkembang menjadi salah satu kontraktor terkemuka di Sumatera Selatan dengan berbagai proyek besar di bidang konstruksi sipil, gedung, dan infrastruktur.', 'Sejarah perusahaan'),
-- Geofence Settings
('officeLat', '-2.9795731113284303', 'Latitude kantor untuk geofence'),
('officeLng', '104.73111003716011', 'Longitude kantor untuk geofence'),
('geofenceRadius', '100', 'Radius geofence dalam meter'),
-- Work Schedule Settings
('work_start_time', '08:00', 'Jam mulai kerja (HH:MM)'),
('work_end_time', '17:00', 'Jam selesai kerja (HH:MM)'),
('late_tolerance_minutes', '10', 'Toleransi keterlambatan dalam menit'),
('break_duration_minutes', '60', 'Durasi istirahat dalam menit'),
-- Overtime Rates
('overtime_rate_first_hour', '1.5', 'Multiplier lembur jam pertama'),
('overtime_rate_next_hours', '2.0', 'Multiplier lembur jam berikutnya'),
-- Deduction Rates
('late_penalty_per_minute', '2000', 'Potongan keterlambatan per menit (Rupiah)'),
('bpjs_kesehatan_rate', '0.01', 'Rate BPJS Kesehatan (1%)'),
('bpjs_ketenagakerjaan_rate', '0.02', 'Rate BPJS Ketenagakerjaan JHT (2%)'),
('pph21_rate', '0.05', 'Rate PPh 21 (5%)');

-- ============================================
-- PROSEDUR: Generate Attendance Data
-- Membuat data absensi untuk 3 periode (Okt, Nov, Des 2025)
-- Clock-in: 08:00-08:20 (random)
-- Clock-out: 17:00-17:10 (random)
-- Late threshold: 08:10 (toleransi 10 menit)
-- ============================================

DELIMITER //

DROP PROCEDURE IF EXISTS generate_attendance_data//

CREATE PROCEDURE generate_attendance_data()
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_date DATE;
    DECLARE v_clock_in_minutes INT;
    DECLARE v_clock_out_minutes INT;
    DECLARE v_late_minutes INT;
    DECLARE v_overtime_minutes INT;
    DECLARE v_working_duration INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_day_of_week INT;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE user_cursor CURSOR FOR SELECT id FROM users WHERE role = 'employee';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Generate for October 2025 (1-31)
    SET v_date = '2025-10-01';
    WHILE v_date <= '2025-10-31' DO
        SET v_day_of_week = DAYOFWEEK(v_date);
        -- Skip weekends (1=Sunday, 7=Saturday)
        IF v_day_of_week NOT IN (1, 7) THEN
            OPEN user_cursor;
            read_loop: LOOP
                FETCH user_cursor INTO v_user_id;
                IF done THEN
                    LEAVE read_loop;
                END IF;
                
                -- Random clock-in: 0-20 minutes after 08:00
                SET v_clock_in_minutes = FLOOR(RAND() * 21);
                -- Random clock-out: 0-10 minutes after 17:00
                SET v_clock_out_minutes = FLOOR(RAND() * 11);
                
                -- Calculate late minutes (threshold is 10 minutes)
                IF v_clock_in_minutes > 10 THEN
                    SET v_late_minutes = v_clock_in_minutes - 10;
                    SET v_status = 'late';
                ELSE
                    SET v_late_minutes = 0;
                    SET v_status = 'present';
                END IF;
                
                -- Calculate overtime (after 17:00)
                SET v_overtime_minutes = v_clock_out_minutes;
                
                -- Calculate working duration in minutes
                -- From (08:00 + clock_in_minutes) to (17:00 + clock_out_minutes) minus 60 min break
                SET v_working_duration = (9 * 60) + v_clock_out_minutes - v_clock_in_minutes - 60;
                
                INSERT INTO attendance (
                    user_id, date, clock_in, clock_out, status, approval_status,
                    is_within_geofence_in, is_within_geofence_out, 
                    late_minutes, overtime_minutes, working_duration_minutes,
                    clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng
                ) VALUES (
                    v_user_id,
                    v_date,
                    TIMESTAMP(CONCAT(v_date, ' 08:', LPAD(v_clock_in_minutes, 2, '0'), ':00')),
                    TIMESTAMP(CONCAT(v_date, ' 17:', LPAD(v_clock_out_minutes, 2, '0'), ':00')),
                    v_status,
                    'approved',
                    TRUE, TRUE,
                    v_late_minutes, v_overtime_minutes, v_working_duration,
                    -2.9795731113284303, 104.73111003716011,
                    -2.9795731113284303, 104.73111003716011
                );
            END LOOP;
            CLOSE user_cursor;
            SET done = FALSE;
        END IF;
        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
    
    -- Generate for November 2025 (1-30)
    SET v_date = '2025-11-01';
    WHILE v_date <= '2025-11-30' DO
        SET v_day_of_week = DAYOFWEEK(v_date);
        IF v_day_of_week NOT IN (1, 7) THEN
            OPEN user_cursor;
            read_loop2: LOOP
                FETCH user_cursor INTO v_user_id;
                IF done THEN
                    LEAVE read_loop2;
                END IF;
                
                SET v_clock_in_minutes = FLOOR(RAND() * 21);
                SET v_clock_out_minutes = FLOOR(RAND() * 11);
                
                IF v_clock_in_minutes > 10 THEN
                    SET v_late_minutes = v_clock_in_minutes - 10;
                    SET v_status = 'late';
                ELSE
                    SET v_late_minutes = 0;
                    SET v_status = 'present';
                END IF;
                
                SET v_overtime_minutes = v_clock_out_minutes;
                SET v_working_duration = (9 * 60) + v_clock_out_minutes - v_clock_in_minutes - 60;
                
                INSERT INTO attendance (
                    user_id, date, clock_in, clock_out, status, approval_status,
                    is_within_geofence_in, is_within_geofence_out, 
                    late_minutes, overtime_minutes, working_duration_minutes,
                    clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng
                ) VALUES (
                    v_user_id,
                    v_date,
                    TIMESTAMP(CONCAT(v_date, ' 08:', LPAD(v_clock_in_minutes, 2, '0'), ':00')),
                    TIMESTAMP(CONCAT(v_date, ' 17:', LPAD(v_clock_out_minutes, 2, '0'), ':00')),
                    v_status,
                    'approved',
                    TRUE, TRUE,
                    v_late_minutes, v_overtime_minutes, v_working_duration,
                    -2.9795731113284303, 104.73111003716011,
                    -2.9795731113284303, 104.73111003716011
                );
            END LOOP;
            CLOSE user_cursor;
            SET done = FALSE;
        END IF;
        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
    
    -- Generate for December 2025 (1-31)
    SET v_date = '2025-12-01';
    WHILE v_date <= '2025-12-31' DO
        SET v_day_of_week = DAYOFWEEK(v_date);
        IF v_day_of_week NOT IN (1, 7) THEN
            OPEN user_cursor;
            read_loop3: LOOP
                FETCH user_cursor INTO v_user_id;
                IF done THEN
                    LEAVE read_loop3;
                END IF;
                
                SET v_clock_in_minutes = FLOOR(RAND() * 21);
                SET v_clock_out_minutes = FLOOR(RAND() * 11);
                
                IF v_clock_in_minutes > 10 THEN
                    SET v_late_minutes = v_clock_in_minutes - 10;
                    SET v_status = 'late';
                ELSE
                    SET v_late_minutes = 0;
                    SET v_status = 'present';
                END IF;
                
                SET v_overtime_minutes = v_clock_out_minutes;
                SET v_working_duration = (9 * 60) + v_clock_out_minutes - v_clock_in_minutes - 60;
                
                INSERT INTO attendance (
                    user_id, date, clock_in, clock_out, status, approval_status,
                    is_within_geofence_in, is_within_geofence_out, 
                    late_minutes, overtime_minutes, working_duration_minutes,
                    clock_in_lat, clock_in_lng, clock_out_lat, clock_out_lng
                ) VALUES (
                    v_user_id,
                    v_date,
                    TIMESTAMP(CONCAT(v_date, ' 08:', LPAD(v_clock_in_minutes, 2, '0'), ':00')),
                    TIMESTAMP(CONCAT(v_date, ' 17:', LPAD(v_clock_out_minutes, 2, '0'), ':00')),
                    v_status,
                    'approved',
                    TRUE, TRUE,
                    v_late_minutes, v_overtime_minutes, v_working_duration,
                    -2.9795731113284303, 104.73111003716011,
                    -2.9795731113284303, 104.73111003716011
                );
            END LOOP;
            CLOSE user_cursor;
            SET done = FALSE;
        END IF;
        SET v_date = DATE_ADD(v_date, INTERVAL 1 DAY);
    END WHILE;
END//

DELIMITER ;

-- Execute the procedure
CALL generate_attendance_data();

-- Clean up
DROP PROCEDURE IF EXISTS generate_attendance_data;

-- ============================================
-- DATA DUMMY: Leaves (Pengajuan Cuti) - Periode Okt-Des 2025
-- ============================================
INSERT INTO leaves (user_id, type, start_date, end_date, reason, status, approved_by, approved_at) VALUES
-- Oktober 2025
(3, 'annual', '2025-10-06', '2025-10-07', 'Urusan keluarga di luar kota', 'approved', 1, '2025-10-04 09:00:00'),
(5, 'sick', '2025-10-15', '2025-10-16', 'Sakit flu dan demam', 'approved', 1, '2025-10-15 08:30:00'),
(8, 'other', '2025-10-20', '2025-10-20', 'Menghadiri wisuda saudara', 'approved', 1, '2025-10-18 10:00:00'),
-- November 2025
(2, 'annual', '2025-11-03', '2025-11-05', 'Cuti tahunan - liburan keluarga', 'approved', 1, '2025-11-01 14:00:00'),
(4, 'sick', '2025-11-12', '2025-11-13', 'Sakit gigi dan perlu perawatan', 'approved', 1, '2025-11-12 07:30:00'),
(7, 'annual', '2025-11-24', '2025-11-26', 'Cuti acara pernikahan keluarga', 'approved', 1, '2025-11-20 11:00:00'),
(9, 'other', '2025-11-28', '2025-11-28', 'Mengurus dokumen penting', 'approved', 1, '2025-11-26 09:00:00'),
-- Desember 2025
(3, 'annual', '2025-12-08', '2025-12-10', 'Liburan akhir tahun', 'approved', 1, '2025-12-05 10:00:00'),
(6, 'annual', '2025-12-15', '2025-12-17', 'Mudik akhir tahun', 'approved', 1, '2025-12-12 09:00:00'),
(10, 'annual', '2025-12-22', '2025-12-26', 'Cuti natal dan tahun baru', 'approved', 1, '2025-12-18 14:00:00'),
(11, 'annual', '2025-12-29', '2025-12-31', 'Cuti akhir tahun', 'pending', NULL, NULL),
(5, 'other', '2025-12-24', '2025-12-24', 'Menghadiri acara gereja', 'pending', NULL, NULL);

-- ============================================
-- PROSEDUR: Generate Payroll Data berdasarkan Attendance
-- Formula:
-- basic_salary = hourly_rate * total_working_hours
-- overtime_pay = overtime_hours * hourly_rate * multiplier
-- late_deduction = total_late_minutes * late_penalty_per_minute
-- bpjs_deduction = basic_salary * (bpjs_kesehatan_rate + bpjs_ketenagakerjaan_rate)
-- pph21_deduction = basic_salary * pph21_rate
-- ============================================

DELIMITER //

DROP PROCEDURE IF EXISTS generate_payroll_data//

CREATE PROCEDURE generate_payroll_data()
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_position_id INT;
    DECLARE v_hourly_rate INT;
    DECLARE v_period VARCHAR(7);
    DECLARE v_total_work_minutes INT;
    DECLARE v_total_late_minutes INT;
    DECLARE v_total_overtime_minutes INT;
    DECLARE v_basic_salary INT;
    DECLARE v_overtime_pay INT;
    DECLARE v_late_deduction INT;
    DECLARE v_bpjs_deduction INT;
    DECLARE v_pph21_deduction INT;
    DECLARE v_total_net INT;
    DECLARE v_late_penalty INT DEFAULT 2000;
    DECLARE v_bpjs_rate DECIMAL(4,2) DEFAULT 0.03;
    DECLARE v_pph21_rate DECIMAL(4,2) DEFAULT 0.05;
    DECLARE v_ot_rate_first DECIMAL(3,1) DEFAULT 1.5;
    DECLARE v_ot_rate_next DECIMAL(3,1) DEFAULT 2.0;
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE user_cursor CURSOR FOR 
        SELECT u.id, u.position_id, COALESCE(p.hourly_rate, 30000) 
        FROM users u 
        LEFT JOIN positions p ON u.position_id = p.id 
        WHERE u.role = 'employee';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Generate payroll for each period
    SET v_period = '2025-10';
    WHILE v_period <= '2025-12' DO
        OPEN user_cursor;
        payroll_loop: LOOP
            FETCH user_cursor INTO v_user_id, v_position_id, v_hourly_rate;
            IF done THEN
                LEAVE payroll_loop;
            END IF;
            
            -- Calculate totals from attendance
            SELECT 
                COALESCE(SUM(working_duration_minutes), 0),
                COALESCE(SUM(late_minutes), 0),
                COALESCE(SUM(overtime_minutes), 0)
            INTO v_total_work_minutes, v_total_late_minutes, v_total_overtime_minutes
            FROM attendance 
            WHERE user_id = v_user_id 
            AND DATE_FORMAT(date, '%Y-%m') = v_period
            AND approval_status = 'approved';
            
            -- Calculate salaries
            SET v_basic_salary = FLOOR((v_total_work_minutes / 60) * v_hourly_rate);
            
            -- Overtime calculation: first 60 min at 1.5x, rest at 2.0x
            IF v_total_overtime_minutes <= 60 THEN
                SET v_overtime_pay = FLOOR((v_total_overtime_minutes / 60) * v_hourly_rate * v_ot_rate_first);
            ELSE
                SET v_overtime_pay = FLOOR((1 * v_hourly_rate * v_ot_rate_first) + 
                                          ((v_total_overtime_minutes - 60) / 60) * v_hourly_rate * v_ot_rate_next);
            END IF;
            
            SET v_late_deduction = v_total_late_minutes * v_late_penalty;
            SET v_bpjs_deduction = FLOOR(v_basic_salary * v_bpjs_rate);
            SET v_pph21_deduction = FLOOR(v_basic_salary * v_pph21_rate);
            SET v_total_net = v_basic_salary + v_overtime_pay - v_late_deduction - v_bpjs_deduction - v_pph21_deduction;
            
            INSERT INTO payroll (
                user_id, period, basic_salary, overtime_pay, bonus,
                late_deduction, bpjs_deduction, pph21_deduction, other_deduction,
                total_net, status, finalized_at
            ) VALUES (
                v_user_id, v_period, v_basic_salary, v_overtime_pay, 0,
                v_late_deduction, v_bpjs_deduction, v_pph21_deduction, 0,
                v_total_net, 'final', NOW()
            );
        END LOOP;
        CLOSE user_cursor;
        SET done = FALSE;
        
        -- Move to next period
        IF v_period = '2025-10' THEN SET v_period = '2025-11';
        ELSEIF v_period = '2025-11' THEN SET v_period = '2025-12';
        ELSE SET v_period = '2026-01';
        END IF;
    END WHILE;
END//

DELIMITER ;

-- Execute the procedure
CALL generate_payroll_data();

-- Clean up
DROP PROCEDURE IF EXISTS generate_payroll_data;

-- ============================================
-- Verifikasi data
-- ============================================
SELECT 'Tabel positions:' AS 'Info';
SELECT COUNT(*) AS total_positions FROM positions;

SELECT 'Tabel users:' AS 'Info';
SELECT COUNT(*) AS total_users FROM users;

SELECT 'Tabel attendance:' AS 'Info';
SELECT COUNT(*) AS total_attendance FROM attendance;
SELECT DATE_FORMAT(date, '%Y-%m') AS period, COUNT(*) AS records FROM attendance GROUP BY DATE_FORMAT(date, '%Y-%m');

SELECT 'Tabel leaves:' AS 'Info';
SELECT COUNT(*) AS total_leaves FROM leaves;

SELECT 'Tabel payroll:' AS 'Info';
SELECT COUNT(*) AS total_payroll FROM payroll;
SELECT period, COUNT(*) AS records, SUM(total_net) AS total_gaji FROM payroll GROUP BY period;

SELECT 'Tabel config:' AS 'Info';
SELECT COUNT(*) AS total_config FROM config;

SELECT 'Setup database selesai!' AS 'Status';

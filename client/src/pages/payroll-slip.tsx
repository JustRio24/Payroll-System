import { useRef } from "react";
import { useRoute } from "wouter";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import generatedLogo from "@assets/generated_images/minimalist_geometric_construction_logo.png";

export default function PayrollSlip() {
  const [matchAdmin, paramsAdmin] = useRoute("/admin/payroll/:id");
  const [matchEmp, paramsEmp] = useRoute("/employee/payslips/:id");
  
  const { payrolls, users, config, user: currentUser } = useApp();
  const slipRef = useRef<HTMLDivElement>(null);

  const id = matchAdmin ? paramsAdmin?.id : paramsEmp?.id;
  const payroll = payrolls.find(p => p.id === id);
  const employee = users.find(u => u.id === payroll?.userId);

  // Security check for employee view
  if (matchEmp && currentUser?.role !== 'admin' && currentUser?.id !== payroll?.userId) {
     return <div className="p-8 text-center text-red-500">Unauthorized access to this payslip.</div>;
  }

  if (!payroll || !employee) {
    return <div className="p-8 text-center text-slate-500">Payslip not found</div>;
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(config.companyName.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(config.companyAddress, 105, 26, { align: 'center' });
    doc.text("SLIP GAJI KARYAWAN", 105, 35, { align: 'center' });
    doc.line(20, 38, 190, 38);

    // Employee Info
    doc.setFontSize(10);
    doc.text(`Periode: ${format(new Date(payroll.period + "-01"), "MMMM yyyy")}`, 140, 48);
    
    autoTable(doc, {
      startY: 50,
      body: [
        ['Nama', employee.name, 'Jabatan', employee.position],
        ['NIK', employee.id, 'Status', 'Karyawan Tetap'],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 30 } }
    });

    // Earnings
    doc.text("PENERIMAAN", 14, (doc as any).lastAutoTable.finalY + 10);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 12,
      head: [['Keterangan', 'Jumlah']],
      body: [
        ['Gaji Pokok', formatIDR(payroll.basicSalary)],
        ['Tunjangan Lembur', formatIDR(payroll.overtimePay)],
        ['Bonus', formatIDR(payroll.bonus)],
        [{ content: 'Total Penerimaan', styles: { fontStyle: 'bold' } }, { content: formatIDR(payroll.basicSalary + payroll.overtimePay + payroll.bonus), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'grid',
      headStyles: { fillColor: [222, 226, 230], textColor: 20 },
      columnStyles: { 1: { halign: 'right' } }
    });

    // Deductions
    doc.text("POTONGAN", 14, (doc as any).lastAutoTable.finalY + 10);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 12,
      head: [['Keterangan', 'Jumlah']],
      body: [
        ['BPJS Kesehatan (1%)', formatIDR(payroll.deductions.bpjs * (1/3))], // Rough estimate breakdown
        ['BPJS Ketenagakerjaan (2%)', formatIDR(payroll.deductions.bpjs * (2/3))],
        ['PPh 21', formatIDR(payroll.deductions.pph21)],
        ['Denda Keterlambatan', formatIDR(payroll.deductions.late)],
        [{ content: 'Total Potongan', styles: { fontStyle: 'bold' } }, { content: formatIDR(Object.values(payroll.deductions).reduce((a,b)=>a+b,0)), styles: { fontStyle: 'bold' } }],
      ],
      theme: 'grid',
      headStyles: { fillColor: [222, 226, 230], textColor: 20 },
      columnStyles: { 1: { halign: 'right' } }
    });

    // Net
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PENERIMAAN BERSIH (TAKE HOME PAY)", 14, finalY);
    doc.text(formatIDR(payroll.totalNet), 195, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Palembang, " + format(new Date(), "dd MMMM yyyy"), 140, finalY + 20);
    doc.text("Dibuat Oleh,", 140, finalY + 30);
    doc.text("( Admin HRD )", 140, finalY + 50);

    doc.save(`slip_gaji_${employee.name}_${payroll.period}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Link href={matchAdmin ? "/admin/payroll" : "/employee/payslips"}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold font-display">Slip Gaji Detail</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={downloadPDF} className="bg-slate-900 hover:bg-slate-800">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-lg print:shadow-none print:border-none" id="printable-area">
        <div className="p-8 md:p-12 space-y-8 bg-white text-slate-900" ref={slipRef}>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div className="flex items-center gap-4">
              <img src={generatedLogo} alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-xl font-bold font-display tracking-tight text-slate-900">{config.companyName.toUpperCase()}</h1>
                <p className="text-sm text-slate-500 max-w-xs">{config.companyAddress}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-slate-900">SLIP GAJI</h2>
              <p className="text-slate-500 font-mono">{payroll.id}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Nama Karyawan</span>
                <span className="font-semibold">{employee.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">ID Karyawan</span>
                <span className="font-medium">{employee.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Jabatan</span>
                <span className="font-medium">{employee.position}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Periode</span>
                <span className="font-semibold">{format(new Date(payroll.period + "-01"), "MMMM yyyy")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-500">Tanggal Cetak</span>
                <span className="font-medium">{format(new Date(), "dd MMM yyyy")}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Earnings */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-700 mb-4 border-b border-green-200 pb-2">Penerimaan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Gaji Pokok</span>
                  <span className="font-medium">{formatIDR(payroll.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tunjangan Lembur</span>
                  <span className="font-medium">{formatIDR(payroll.overtimePay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus</span>
                  <span className="font-medium">{formatIDR(payroll.bonus)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-slate-900 text-base">
                  <span>Total Penerimaan</span>
                  <span>{formatIDR(payroll.basicSalary + payroll.overtimePay + payroll.bonus)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 mb-4 border-b border-red-200 pb-2">Potongan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>BPJS Kesehatan & TK</span>
                  <span className="font-medium text-red-600">({formatIDR(payroll.deductions.bpjs)})</span>
                </div>
                <div className="flex justify-between">
                  <span>PPh 21</span>
                  <span className="font-medium text-red-600">({formatIDR(payroll.deductions.pph21)})</span>
                </div>
                <div className="flex justify-between">
                  <span>Denda Keterlambatan</span>
                  <span className="font-medium text-red-600">({formatIDR(payroll.deductions.late)})</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-slate-900 text-base">
                  <span>Total Potongan</span>
                  <span>({formatIDR(Object.values(payroll.deductions).reduce((a,b)=>a+b,0))})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">Gaji Bersih (Take Home Pay)</p>
              <p className="text-xs text-slate-400 mt-1">Terbilang: # Nominal Bersih #</p>
            </div>
            <div className="text-3xl font-bold text-slate-900 font-display">
              {formatIDR(payroll.totalNet)}
            </div>
          </div>

          {/* Signature */}
          <div className="pt-12 grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-20">Penerima,</p>
              <p className="font-bold border-t border-slate-300 inline-block px-8 pt-2">{employee.name}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-20">Mengetahui,</p>
              <p className="font-bold border-t border-slate-300 inline-block px-8 pt-2">Manager HRD</p>
            </div>
          </div>

        </div>
      </Card>
      
      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .shadow-lg { box-shadow: none; }
          .border-slate-200 { border: none; }
        }
      `}</style>
    </div>
  );
}

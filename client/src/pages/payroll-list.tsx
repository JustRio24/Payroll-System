import { useState } from "react";
// 1. Pastikan mengambil 'user' dari store untuk mengecek role yang sedang login
import { useApp } from "@/lib/store"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subMonths } from "date-fns";
import { FileText, PlayCircle, Gift } from "lucide-react";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export default function PayrollList() {
  // 2. Tambahkan 'user' di sini
  const { payrolls, users, generatePayroll, finalizePayroll, user } = useApp();
  const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [showBonusDialog, setShowBonusDialog] = useState(false);
  const [manualBonuses, setManualBonuses] = useState<Record<number, number>>({});

  const handleOpenBonusDialog = () => {
    const employees = users.filter(u => u.role !== 'admin');
    const initial: Record<number, number> = {};
    employees.forEach(e => { initial[e.id] = 0; });
    setManualBonuses(initial);
    setShowBonusDialog(true);
  };

  const handleGenerate = () => {
    generatePayroll(period, manualBonuses);
    setShowBonusDialog(false);
  };

  const handleQuickGenerate = () => {
    generatePayroll(period);
  };

  const filteredPayrolls = payrolls.filter(p => p.period === period);

  // Currency formatter
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Payroll</h2>
          <p className="text-slate-500">Manage salaries and payslips</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]" data-testid="select-period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }).map((_, i) => {
                const date = subMonths(new Date(), i);
                const val = format(date, "yyyy-MM");
                return <SelectItem key={val} value={val}>{format(date, "MMMM yyyy")}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          
          {/* 3. LOGIC UTAMA: Hanya tampilkan tombol jika role adalah 'finance' */}
          {user?.role === 'finance' && (
            <>
              <Button onClick={handleOpenBonusDialog} variant="outline" data-testid="button-bonus-dialog">
                <Gift className="w-4 h-4 mr-2" /> With Bonus
              </Button>
              <Button onClick={handleQuickGenerate} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-generate-payroll">
                <PlayCircle className="w-4 h-4 mr-2" /> Generate
              </Button>
            </>
          )}

        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        {/* ... (sisa kode Card dan Table sama persis seperti sebelumnya) ... */}
        <CardHeader>
           <CardTitle>Payroll Records - {format(new Date(period + "-01"), "MMMM yyyy")}</CardTitle>
           <CardDescription>
             {filteredPayrolls.length} records generated
           </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Bonus</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.map((payroll) => {
                const userItem = users.find(u => u.id === payroll.userId);
                const totalDeductions = Object.values(payroll.deductions).reduce((a, b) => a + b, 0);
                
                return (
                  <TableRow key={payroll.id} data-testid={`row-payroll-${payroll.id}`}>
                    <TableCell className="font-medium">
                       <div>{userItem?.name}</div>
                       <div className="text-xs text-slate-500">{userItem?.position}</div>
                    </TableCell>
                    <TableCell className="text-right">{formatIDR(payroll.basicSalary)}</TableCell>
                    <TableCell className="text-right text-green-600">+{formatIDR(payroll.overtimePay)}</TableCell>
                    <TableCell className="text-right text-blue-600">{payroll.bonus > 0 ? `+${formatIDR(payroll.bonus)}` : '-'}</TableCell>
                    <TableCell className="text-right text-red-600">-{formatIDR(totalDeductions)}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{formatIDR(payroll.totalNet)}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className={payroll.status === 'final' ? 'border-green-500 text-green-700' : 'border-slate-300 text-slate-500'}>
                         {payroll.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-1">
                         {/* Opsi tambahan: Tombol Finalize juga biasanya hanya untuk finance */}
                         {payroll.status === 'draft' && user?.role === 'finance' && (
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             title="Finalize & Approve"
                             className="text-green-600 hover:text-green-700 hover:bg-green-50"
                             onClick={() => finalizePayroll(payroll.id)}
                             data-testid={`button-finalize-${payroll.id}`}
                           >
                             <CheckCircle className="w-4 h-4" />
                           </Button>
                         )}
                         <Link href={`/admin/payroll/${payroll.id}`}>
                           <Button variant="ghost" size="icon" title="View Details" data-testid={`button-view-${payroll.id}`}>
                             <FileText className="w-4 h-4 text-slate-500" />
                           </Button>
                         </Link>
                       </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredPayrolls.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                      No payroll records found for this period. {user?.role === 'finance' ? 'Click "Generate" to calculate.' : ''}
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog juga hanya perlu dirender jika user adalah finance (untuk keamanan tambahan) */}
      {user?.role === 'finance' && (
        <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
            <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Manual Bonus Input</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-500 mb-4">
                Enter bonus amounts for each employee for {format(new Date(period + "-01"), "MMMM yyyy")}
            </p>
            <ScrollArea className="max-h-[300px] pr-4">
                <div className="space-y-3">
                {users.filter(u => u.role !== 'admin').map(emp => (
                    <div key={emp.id} className="flex items-center gap-3">
                    <Label className="flex-1 text-sm">{emp.name}</Label>
                    <Input
                        type="number"
                        placeholder="0"
                        className="w-32 text-right"
                        value={manualBonuses[emp.id] || ''}
                        onChange={e => setManualBonuses(prev => ({
                        ...prev,
                        [emp.id]: parseInt(e.target.value) || 0
                        }))}
                        data-testid={`input-bonus-${emp.id}`}
                    />
                    </div>
                ))}
                </div>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowBonusDialog(false)}>Cancel</Button>
                <Button onClick={handleGenerate} className="bg-orange-500 hover:bg-orange-600" data-testid="button-confirm-generate">
                Generate Payroll
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
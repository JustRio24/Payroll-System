import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function EmployeePayslips() {
  const { user, payrolls } = useApp();

  const myPayrolls = payrolls
    .filter(p => p.userId === user?.id && p.status === 'final') // Only show final payslips to employees usually
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

  // Also include drafts for demo purposes if needed, or filter strictly. 
  // For this prototype, let's show all for visibility.
  const displayPayrolls = payrolls
    .filter(p => p.userId === user?.id)
    .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">My Payslips</h2>
        <p className="text-slate-500">View and download your salary history</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
           <CardTitle>History</CardTitle>
           <CardDescription>
             Monthly salary statements
           </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayPayrolls.map((payroll) => {
                const totalDeductions = Object.values(payroll.deductions).reduce((a, b) => a + b, 0);
                
                return (
                  <TableRow key={payroll.id}>
                    <TableCell className="font-medium">
                       {format(new Date(payroll.period + "-01"), "MMMM yyyy")}
                    </TableCell>
                    <TableCell>{formatIDR(payroll.basicSalary)}</TableCell>
                    <TableCell className="text-green-600">+{formatIDR(payroll.overtimePay)}</TableCell>
                    <TableCell className="text-red-600">-{formatIDR(totalDeductions)}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{formatIDR(payroll.totalNet)}</TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className={payroll.status === 'final' ? 'border-green-500 text-green-700' : 'border-slate-300 text-slate-500'}>
                         {payroll.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/employee/payslips/${payroll.id}`}>
                         <Button variant="ghost" size="icon">
                           <FileText className="w-4 h-4 text-slate-500" />
                         </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {displayPayrolls.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      No payslips found.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

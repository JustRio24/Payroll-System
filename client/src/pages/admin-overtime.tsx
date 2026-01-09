import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminOvertime() {
  // 1. Tambahkan 'user' untuk pengecekan role
  const { overtime, users, approveOvertime, user } = useApp();

  const sortedRequests = [...overtime].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper boolean untuk mengecek apakah user BUKAN finance
  const canApprove = user?.role !== 'finance';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Overtime Review</h2>
        <p className="text-slate-500">Approve or reject employee overtime submissions</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Pending and recent overtime records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                {/* 2. Hide Header Action jika role finance */}
                {canApprove && (
                  <TableHead className="text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.length === 0 ? (
                <TableRow>
                  {/* Sesuaikan colspan jika kolom action hilang */}
                  <TableCell colSpan={canApprove ? 6 : 5} className="text-center py-10 text-slate-400">
                    No overtime requests found
                  </TableCell>
                </TableRow>
              ) : (
                sortedRequests.map((req) => {
                  const employee = users.find(u => u.id === req.userId);
                  
                  return (
                    <TableRow key={req.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee?.avatar || undefined} />
                            <AvatarFallback>{employee?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-sm">{employee?.name}</div>
                            <div className="text-xs text-slate-500">{employee?.position}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(req.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {req.durationMinutes} mins
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px] text-sm text-slate-600 italic">
                        "{req.reason}"
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${
                          req.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 
                          req.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-none' : 
                          'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none'
                        }`}>
                          {req.status}
                        </Badge>
                      </TableCell>
                      
                      {/* 3. Hide Cell Action (Button) jika role finance */}
                      {canApprove && (
                        <TableCell className="text-right">
                          {req.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-green-600 hover:bg-green-50 border-green-200"
                                onClick={() => approveOvertime(req.id, 'approved')}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2 text-red-600 hover:bg-red-50 border-red-200"
                                onClick={() => approveOvertime(req.id, 'rejected')}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {req.status !== 'pending' && (
                            <span className="text-xs text-slate-400">Processed</span>
                          )}
                        </TableCell>
                      )}

                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
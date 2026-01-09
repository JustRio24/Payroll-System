import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AdminLeaves() {
  // 1. Ambil 'user' dari store
  const { leaves, users, approveLeave, user } = useApp();

  const sortedLeaves = [...leaves].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  // Helper: Cek apakah user BUKAN finance (jadi boleh lihat action)
  const showAction = user?.role !== 'finance';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Leave Requests</h2>
        <p className="text-slate-500">Manage time off and permissions</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
           <CardTitle>Requests</CardTitle>
           <CardDescription>
             Pending and processed requests
           </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Status</TableHead>
                {/* 2. Hide Header Action jika role finance */}
                {showAction && (
                  <TableHead className="text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeaves.map((leave) => {
                const userItem = users.find(u => u.id === leave.userId);
                
                return (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userItem?.avatar} />
                          <AvatarFallback>{userItem?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{userItem?.name}</div>
                          <div className="text-xs text-slate-500">{userItem?.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{leave.type}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      {leave.attachment ? (
                         <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">
                           <FileText className="w-3 h-3 mr-1" /> View
                         </Button>
                      ) : (
                         <span className="text-slate-400 text-xs">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    
                    {/* 3. Hide Cell Action jika role finance */}
                    {showAction && (
                      <TableCell className="text-right">
                        {leave.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveLeave(leave.id, 'approved')}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => approveLeave(leave.id, 'rejected')}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}

                  </TableRow>
                );
              })}
              {sortedLeaves.length === 0 && (
                <TableRow>
                  {/* Sesuaikan colSpan: 7 jika ada action, 6 jika tidak */}
                  <TableCell colSpan={showAction ? 7 : 6} className="text-center py-8 text-slate-400">
                    No leave requests found.
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
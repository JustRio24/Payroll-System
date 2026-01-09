import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Camera, Image as ImageIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminAttendance() {
  // 1. Ambil 'user' dari store
  const { attendance, users, approveAttendance, user } = useApp();

  const sortedAttendance = [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Helper: Cek apakah boleh menampilkan validasi (bukan finance)
  const showValidation = user?.role !== 'finance';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display">Attendance Validation</h2>
        <p className="text-slate-500">Review and approve employee clock-ins</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
            <CardTitle>Daily Log</CardTitle>
            <CardDescription>
              Recent activity requiring attention
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time In</TableHead>
                <TableHead>Time Out</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Status</TableHead>
                {/* 2. Hide Header Validation jika finance */}
                {showValidation && (
                  <TableHead className="text-right">Validation</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttendance.map((att) => {
                const userItem = users.find(u => u.id === att.userId);
                
                return (
                  <TableRow key={att.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userItem?.avatar || undefined} />
                          <AvatarFallback>{userItem?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{userItem?.name}</div>
                          <div className="text-xs text-slate-500">{userItem?.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(att.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{att.clockIn ? format(new Date(att.clockIn), "HH:mm") : "-"}</TableCell>
                    <TableCell>{att.clockOut ? format(new Date(att.clockOut), "HH:mm") : "-"}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={`w-fit text-[10px] ${att.isWithinGeofenceIn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            IN: {att.isWithinGeofenceIn ? "Valid" : "Outside"}
                          </Badge>
                          {att.clockOut && (
                            <Badge variant="outline" className={`w-fit text-[10px] ${att.isWithinGeofenceOut ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
                              OUT: {att.isWithinGeofenceOut ? "Valid" : "Outside"}
                            </Badge>
                          )}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                          {att.clockInPhoto && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <Camera className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2">
                                <p className="text-xs font-semibold mb-2 text-slate-900">Clock In Photo</p>
                                <img src={att.clockInPhoto} alt="Clock In" className="w-full h-auto rounded shadow-sm" />
                              </PopoverContent>
                            </Popover>
                          )}
                          {att.clockOutPhoto && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <ImageIcon className="h-4 w-4 text-slate-500" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64 p-2">
                                <p className="text-xs font-semibold mb-2 text-slate-900">Clock Out Photo</p>
                                <img src={att.clockOutPhoto} alt="Clock Out" className="w-full h-auto rounded shadow-sm" />
                              </PopoverContent>
                            </Popover>
                          )}
                          {!att.clockInPhoto && !att.clockOutPhoto && <span className="text-xs text-slate-400">None</span>}
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`capitalize ${
                        att.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                        att.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {att.approvalStatus}
                      </Badge>
                    </TableCell>
                    
                    {/* 3. Hide Cell Validation (Action Buttons) jika finance */}
                    {showValidation && (
                      <TableCell className="text-right">
                          {att.approvalStatus === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => approveAttendance(att.id, 'approved')}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => approveAttendance(att.id, 'rejected')}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                      </TableCell>
                    )}

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
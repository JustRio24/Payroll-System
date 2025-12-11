import { useApp, User, JobPosition } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "employee";
  positionId: number | null;
  joinDate: string;
  phone: string;
  address: string;
  status: string;
}

const defaultFormData: EmployeeFormData = {
  name: "",
  email: "",
  password: "password",
  role: "employee",
  positionId: null,
  joinDate: format(new Date(), "yyyy-MM-dd"),
  phone: "",
  address: "",
  status: "active",
};

export default function AdminEmployees() {
  const { users, positions, createUser, updateUser, deleteUser, isLoading } = useApp();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const filteredUsers = users.filter(user => 
    user.role !== 'admin' && 
    (user.name.toLowerCase().includes(search.toLowerCase()) || 
     (user.position || '').toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData(defaultFormData);
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (employee: User) => {
    setFormMode("edit");
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: "",
      role: employee.role,
      positionId: employee.positionId || null,
      joinDate: employee.joinDate || format(new Date(), "yyyy-MM-dd"),
      phone: employee.phone || "",
      address: employee.address || "",
      status: employee.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleOpenView = (employee: User) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleOpenDelete = (employee: User) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (formMode === "create") {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password || "password",
          role: formData.role,
          positionId: formData.positionId,
          joinDate: formData.joinDate,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
        });
      } else if (selectedEmployee) {
        const updateData: Partial<User> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          positionId: formData.positionId,
          joinDate: formData.joinDate,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(selectedEmployee.id, updateData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    setIsSubmitting(true);
    try {
      await deleteUser(selectedEmployee.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPositionTitle = (positionId: number | null | undefined) => {
    if (!positionId) return "Unknown";
    const pos = positions.find(p => p.id === positionId);
    return pos?.title || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display" data-testid="text-page-title">Employees</h2>
          <p className="text-slate-500">Manage your workforce directory</p>
        </div>
        <Button 
          className="bg-slate-900 hover:bg-slate-800" 
          onClick={handleOpenCreate}
          data-testid="button-add-employee"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4 pb-4">
          <div className="space-y-1">
            <CardTitle>Directory</CardTitle>
            <CardDescription>
              {filteredUsers.length} active employees
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or position" 
              className="pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-slate-50" data-testid={`row-employee-${employee.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={employee.avatar || undefined} />
                          <AvatarFallback className="bg-slate-200 text-slate-700">{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold" data-testid={`text-name-${employee.id}`}>{employee.name}</div>
                          <div className="text-sm text-slate-500" data-testid={`text-email-${employee.id}`}>{employee.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-position-${employee.id}`}>
                      {employee.position || getPositionTitle(employee.positionId)}
                    </TableCell>
                    <TableCell data-testid={`text-joindate-${employee.id}`}>
                      {employee.joinDate ? format(new Date(employee.joinDate), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={employee.status === "active" ? "default" : "secondary"}
                        className={employee.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {employee.status || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${employee.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenView(employee)} data-testid={`button-view-${employee.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(employee)} data-testid={`button-edit-${employee.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenDelete(employee)} 
                            className="text-red-600"
                            data-testid={`button-delete-${employee.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      {search ? `No employees found matching "${search}"` : "No employees found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add New Employee" : "Edit Employee"}</DialogTitle>
            <DialogDescription>
              {formMode === "create" ? "Fill in the details to add a new employee." : "Update employee information."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
                data-testid="input-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="employee@company.com"
                required
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {formMode === "edit" && "(leave blank to keep current)"}</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={formMode === "create" ? "Enter password" : "New password (optional)"}
                required={formMode === "create"}
                data-testid="input-password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select 
                  value={formData.positionId?.toString() || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, positionId: parseInt(value) }))}
                >
                  <SelectTrigger data-testid="select-position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id?.toString() || ""}>
                        {pos.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input 
                  id="joinDate" 
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, joinDate: e.target.value }))}
                  data-testid="input-joindate"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="081234567890"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
                className="resize-none"
                data-testid="input-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
                {isSubmitting ? "Saving..." : (formMode === "create" ? "Create Employee" : "Save Changes")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatar || undefined} />
                  <AvatarFallback className="text-xl">{selectedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-slate-500">{selectedEmployee.position || getPositionTitle(selectedEmployee.positionId)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Phone</p>
                  <p className="font-medium">{selectedEmployee.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Join Date</p>
                  <p className="font-medium">
                    {selectedEmployee.joinDate ? format(new Date(selectedEmployee.joinDate), "MMM dd, yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge variant={selectedEmployee.status === "active" ? "default" : "secondary"}>
                    {selectedEmployee.status || "active"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">Address</p>
                  <p className="font-medium">{selectedEmployee.address || "-"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (selectedEmployee) handleOpenEdit(selectedEmployee);
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedEmployee?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSubmitting}
              data-testid="button-confirm-delete"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

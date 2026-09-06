import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAllUsers } from "@/features/admin/server/queries";
import { RoleSelect } from "@/features/admin/components/role-select";
import { formatRelativeDate } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-ink-900 text-2xl font-bold">Users</h1>

      <div className="border-line overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-ink-900 font-medium">{user.name}</TableCell>
                <TableCell className="text-ink-600 text-sm">{user.email}</TableCell>
                <TableCell className="text-ink-500 text-sm">
                  {formatRelativeDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <RoleSelect
                    userId={user.id}
                    role={user.role}
                    disabled={user.id === admin.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// File: app/admin/page.tsx

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

// --- Server Action for the Admin ---
async function toggleUserBanStatus(userId: string, currentStatus: boolean) {
    "use server";
    await prisma.user.update({
        where: { id: userId },
        data: { isBanned: !currentStatus },
    });
    revalidatePath("/admin");
}

// --- The Main Admin Page Component ---
export default async function AdminPage() {
    // Fetch all data in parallel for efficiency
    const [totalUsers, totalSwaps, totalSkills, allUsers] = await Promise.all([
        prisma.user.count(),
        prisma.swapRequest.count(),
        prisma.skill.count(),
        prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSwaps}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSkills}</div>
                    </CardContent>
                </Card>
            </div>

            {/* User Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Joined On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{format(new Date(user.createdAt), 'PPP')}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isBanned ? 'destructive' : 'secondary'}>
                                            {user.isBanned ? 'Banned' : 'Active'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form action={toggleUserBanStatus.bind(null, user.id, user.isBanned)}>
                                            <Button variant="ghost" size="icon" type="submit">
                                                {user.isBanned ? <UserCheck className="h-4 w-4 text-green-500"/> : <UserX className="h-4 w-4 text-red-500"/>}
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
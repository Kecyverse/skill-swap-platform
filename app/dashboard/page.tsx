// File: app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Trash2 } from "lucide-react";
import LeaveFeedbackDialog from "@/components/LeaveFeedbackDialog";

// --- SERVER ACTIONS for this page ---
// These functions run on the server when called by the form actions below.

async function updateSwapStatus(requestId: string, newStatus: 'ACCEPTED' | 'REJECTED') {
    "use server";
    // Security check: ensure the current user is the requestee before updating
    const session = await getServerSession(authOptions);
    const swap = await prisma.swapRequest.findFirst({
        where: { id: requestId, requesteeId: session?.user?.id },
    });
    if (!swap) {
        throw new Error("Swap request not found or you don't have permission to modify it.");
    }
    await prisma.swapRequest.update({
        where: { id: requestId },
        data: { status: newStatus },
    });
    revalidatePath("/dashboard");
}

async function deleteSwapRequest(requestId: string) {
    "use server";
    // Security check: ensure the current user is the requester before deleting
    const session = await getServerSession(authOptions);
    const swap = await prisma.swapRequest.findFirst({
        where: { id: requestId, requesterId: session?.user?.id },
    });
    if (!swap) {
        throw new Error("Swap request not found or you don't have permission to delete it.");
    }
    await prisma.swapRequest.delete({
        where: { id: requestId },
    });
    revalidatePath("/dashboard");
}


// --- THE MAIN PAGE COMPONENT ---
export default async function DashboardSwapsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  const userId = session.user.id;

  const requestsReceived = await prisma.swapRequest.findMany({
    where: { requesteeId: userId },
    include: { requester: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const requestsMade = await prisma.swapRequest.findMany({
    where: { requesterId: userId },
    include: { requestee: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Swaps</h1>
        <Button asChild>
          <Link href="/dashboard/edit">Manage My Profile</Link>
        </Button>
      </div>

      {/* INCOMING REQUESTS CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Requests</CardTitle>
          <CardDescription>Requests from other users for your skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestsReceived.length > 0 ? (
            requestsReceived.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={req.requester.image ?? ""} />
                    <AvatarFallback>{req.requester.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{req.requester.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">{req.message}</p>
                  </div>
                </div>
                {/* Conditional Action Buttons */}
                <div className="flex items-center gap-2">
                    {req.status === 'PENDING' && (
                        <>
                            <form action={updateSwapStatus.bind(null, req.id, 'ACCEPTED')}>
                                <Button size="icon" variant="outline" className="text-green-500 hover:bg-green-50 hover:text-green-600"><Check size={16}/></Button>
                            </form>
                            <form action={updateSwapStatus.bind(null, req.id, 'REJECTED')}>
                                <Button size="icon" variant="outline" className="text-red-500 hover:bg-red-50 hover:text-red-600"><X size={16}/></Button>
                            </form>
                        </>
                    )}
                    {req.status === 'ACCEPTED' && !req.requesteeHasRated && (
                        <LeaveFeedbackDialog swapRequestId={req.id} targetUserName={req.requester.name ?? 'User'} />
                    )}
                    {(req.status === 'REJECTED' || (req.status === 'ACCEPTED' && req.requesteeHasRated)) && (
                        <Badge variant={req.status === 'ACCEPTED' ? 'default' : 'destructive'}>{req.status}</Badge>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No incoming requests yet.</p>
          )}
        </CardContent>
      </Card>

      {/* OUTGOING REQUESTS CARD */}
      <Card>
        <CardHeader>
          <CardTitle>Outgoing Requests</CardTitle>
          <CardDescription>Requests you've sent to other users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestsMade.length > 0 ? (
            requestsMade.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={req.requestee.image ?? ""} />
                    <AvatarFallback>{req.requestee.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{req.requestee.name}</p>
                     <p className="text-sm text-muted-foreground truncate max-w-xs">{req.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    {req.status === 'PENDING' ? (
                        <>
                            <Badge variant="secondary">{req.status}</Badge>
                            <form action={deleteSwapRequest.bind(null, req.id)}>
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></Button>
                            </form>
                        </>
                    ) : req.status === 'ACCEPTED' && !req.requesterHasRated ? (
                        <LeaveFeedbackDialog swapRequestId={req.id} targetUserName={req.requestee.name ?? 'User'} />
                    ) : (
                        <Badge variant={req.status === 'ACCEPTED' ? 'default' : 'destructive'}>{req.status}</Badge>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">You haven't sent any requests yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
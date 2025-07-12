// File: app/actions.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSwapRequest(requesteeId: string, message: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("You must be logged in to make a request.");
  }

  const requesterId = session.user.id;

  // Prevent users from requesting a swap with themselves
  if (requesterId === requesteeId) {
    throw new Error("You cannot request a swap with yourself.");
  }

  // Create the swap request in the database
  await prisma.swapRequest.create({
    data: {
      requesterId: requesterId,
      requesteeId: requesteeId,
      message: message,
      status: 'PENDING',
    },
  });

  // Revalidate the dashboard path of the person who received the request
  // This isn't perfect, but it's a way to trigger updates.
  // A full real-time system would use websockets.
  revalidatePath("/dashboard");
}
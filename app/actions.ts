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

// File: app/actions.ts
// ... other imports and functions

export async function submitFeedback(data: {
  swapRequestId: string;
  score: number;
  comment: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("You must be logged in to leave feedback.");
  }

  const raterId = session.user.id;
  const { swapRequestId, score, comment } = data;

  // Find the swap to determine who is who and check status
  const swap = await prisma.swapRequest.findUnique({
    where: { id: swapRequestId },
  });

  if (!swap || swap.status !== 'ACCEPTED') {
    throw new Error("Feedback can only be left on accepted swaps.");
  }

  const isRaterTheRequester = swap.requesterId === raterId;
  const rateeId = isRaterTheRequester ? swap.requesteeId : swap.requesterId;

  // Check if this user has already rated for this swap
  if ((isRaterTheRequester && swap.requesterHasRated) || (!isRaterTheRequester && swap.requesteeHasRated)) {
      throw new Error("You have already left feedback for this swap.");
  }

  // Use a transaction to perform multiple operations safely
  await prisma.$transaction(async (tx) => {
    // 1. Create the new rating
    await tx.rating.create({
      data: {
        score,
        comment,
        raterId,
        rateeId,
        swapRequestId,
      },
    });

    // 2. Update the swap request to mark that feedback has been given
    await tx.swapRequest.update({
      where: { id: swapRequestId },
      data: isRaterTheRequester
        ? { requesterHasRated: true }
        : { requesteeHasRated: true },
    });

    // 3. Recalculate and update the average rating for the user who was rated
    const allRatings = await tx.rating.findMany({
      where: { rateeId: rateeId },
      select: { score: true },
    });

    const totalScore = allRatings.reduce((acc, r) => acc + r.score, 0);
    const newAverage = totalScore / allRatings.length;

    await tx.user.update({
      where: { id: rateeId },
      data: { averageRating: newAverage },
    });
  });

  // Revalidate paths to show new data
  revalidatePath("/dashboard");
  revalidatePath(`/profile/${rateeId}`);
}
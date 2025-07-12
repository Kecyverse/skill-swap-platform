// File: components/LeaveFeedbackDialog.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Star } from "lucide-react";
import { submitFeedback } from "@/app/actions"; // <-- The only reference to submitFeedback

type LeaveFeedbackDialogProps = {
  swapRequestId: string;
  targetUserName: string;
};

export default function LeaveFeedbackDialog({ swapRequestId, targetUserName }: LeaveFeedbackDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    try {
      // This now correctly calls the imported function
      await submitFeedback({ swapRequestId, score: rating, comment });
      alert("Feedback submitted successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      alert((error as Error).message || "Failed to submit feedback.");
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Leave Feedback</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Feedback for {targetUserName}</DialogTitle>
          <DialogDescription>Your feedback helps build a trustworthy community.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-center justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`cursor-pointer transition-colors ${
                            (hoverRating || rating) >= star
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
            </div>
            <Textarea
                placeholder="Add a public comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>Submit Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
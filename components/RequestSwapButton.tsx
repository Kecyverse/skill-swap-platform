// File: components/RequestSwapButton.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

type RequestSwapButtonProps = {
  targetUserId: string;
};

export default function RequestSwapButton({ targetUserId }: RequestSwapButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else {
      // TODO: Open the swap request modal/dialog
      alert(`Requesting swap with user ${targetUserId}`);
    }
  };
  
  // Don't show the button on your own card
  if(session?.user?.id === targetUserId) {
      return null;
  }

  return <Button onClick={handleClick}>Request Swap</Button>;
}
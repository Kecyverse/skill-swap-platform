// File: app/profile/[userId]/page.tsx

import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { MapPin, Calendar } from "lucide-react";
import RequestSwapDialog from "@/components/RequestSwapDialog"; // <-- Import the new dialog component

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
      isPublic: true,
    },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
          <Avatar className="w-32 h-32 border-4 border-primary/20 mb-4">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback className="text-4xl">
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{user.name}</h1>

          <div className="space-y-3 mt-4 text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.availability && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{user.availability}</span>
              </div>
            )}
          </div>

          <div className="mt-6 w-full">
            {/* --- THIS IS THE KEY CHANGE --- */}
            <RequestSwapDialog
              targetUserId={user.id}
              targetUserName={user.name ?? "User"}
            />
            {/* ----------------------------- */}
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
              Skills Offered
            </h2>
            {user.skillsOffered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map(({ skill }) => (
                  <Badge key={skill.id} className="text-sm px-3 py-1">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                This user hasn't listed any skills they offer yet.
              </p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
              Skills Wanted
            </h2>
            {user.skillsWanted.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.map(({ skill }) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="text-sm px-3 py-1"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                This user isn't looking for any specific skills right now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
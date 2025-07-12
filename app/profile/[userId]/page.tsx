// File: app/profile/[userId]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import RequestSwapDialog from "@/components/RequestSwapDialog";
import { MapPin, Calendar, Star } from "lucide-react";
import { format } from 'date-fns';

// A helper component to render stars, you can keep this in the same file or move it
function StarRatingDisplay({ rating }: { rating: number }) {
    const totalStars = 5;
    const filledStars = Math.round(rating);
    return (
        <div className="flex items-center gap-1">
            {[...Array(totalStars)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < filledStars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>
            ))}
            <span className="text-muted-foreground text-sm ml-1">({rating.toFixed(1)})</span>
        </div>
    );
}

type ProfilePageProps = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId, isPublic: true },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
      ratingsReceived: { // <-- Include the ratings data
        orderBy: { createdAt: 'desc' },
        include: {
            rater: { select: { name: true, image: true } } // Get the reviewer's info
        }
      }
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Left Column: User Info */}
        <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
          <Avatar className="w-32 h-32 border-4 border-primary/20 mb-4">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback className="text-4xl">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          
          {/* Average Rating Display */}
          {user.averageRating ? (
            <div className="mt-2">
                <StarRatingDisplay rating={user.averageRating} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No ratings yet</p>
          )}
          
          <div className="space-y-3 mt-4 text-muted-foreground">
            {user.location && (<div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{user.location}</span></div>)}
            {user.availability && (<div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{user.availability}</span></div>)}
          </div>
          <div className="mt-6 w-full"><RequestSwapDialog targetUserId={user.id} targetUserName={user.name ?? 'User'} /></div>
        </div>

        {/* Right Column: Skills */}
        <div className="md:col-span-2 space-y-8">
            <div>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Skills Offered</h2>
                {user.skillsOffered.length > 0 ? (<div className="flex flex-wrap gap-2">{user.skillsOffered.map(({ skill }) => (<Badge key={skill.id} className="text-sm px-3 py-1">{skill.name}</Badge>))}</div>) : (<p className="text-muted-foreground">This user hasn't listed any skills they offer yet.</p>)}
            </div>
            <div>
                <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Skills Wanted</h2>
                {user.skillsWanted.length > 0 ? (<div className="flex flex-wrap gap-2">{user.skillsWanted.map(({ skill }) => (<Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1">{skill.name}</Badge>))}</div>) : (<p className="text-muted-foreground">This user isn't looking for any specific skills right now.</p>)}
            </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Feedback & Reviews ({user.ratingsReceived.length})</h2>
        <div className="space-y-6">
            {user.ratingsReceived.length > 0 ? (
                user.ratingsReceived.map(rating => (
                    <div key={rating.id} className="flex gap-4">
                        <Avatar>
                            <AvatarImage src={rating.rater.image ?? ""} />
                            <AvatarFallback>{rating.rater.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold">{rating.rater.name}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(rating.createdAt), "PPP")}</p>
                            </div>
                            <div className="flex items-center my-1"><StarRatingDisplay rating={rating.score} /></div>
                            <p className="text-sm text-foreground/80">{rating.comment}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-center py-8">This user has not received any feedback yet.</p>
            )}
        </div>
      </div>

    </div>
  );
}
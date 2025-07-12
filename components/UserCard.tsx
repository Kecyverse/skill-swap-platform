// File: components/UserCard.tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserWithSkills } from '@/app/page'; // <-- Step 1: Import the type
import RequestSwapButton from "./RequestSwapButton";

// Step 2: Define the props type using our new, specific type
type UserCardProps = {
  user: UserWithSkills;
};

export default function UserCard({ user }: UserCardProps) {
  // Defensive check in case user or name is null
  if (!user || !user.name) {
    return null; 
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={user.image || ''} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg">{user.name}</h3>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow">
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Offers:</h4>
          <div className="flex flex-wrap gap-1">
            {user.skillsOffered.length > 0 ? (
              user.skillsOffered.map(s => <Badge key={s.skill.id}>{s.skill.name}</Badge>)
            ) : (
              <p className="text-sm text-gray-500">No skills offered.</p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Wants:</h4>
          <div className="flex flex-wrap gap-1">
            {user.skillsWanted.length > 0 ? (
              user.skillsWanted.map(s => <Badge variant="secondary" key={s.skill.id}>{s.skill.name}</Badge>)
            ) : (
              <p className="text-sm text-gray-500">No skills wanted.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/profile/${user.id}`}>View Details</Link>
        </Button>
        <RequestSwapButton targetUserId={user.id} /> {/* <-- Use the new component */}
      </CardFooter>
    </Card>
  );
}
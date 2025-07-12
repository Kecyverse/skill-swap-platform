// File: app/page.tsx
import prisma from "@/lib/prisma";
import UserCard from "@/components/UserCard";
import SearchAndFilterBar from "@/components/SearchAndFilterBar";
import { Prisma } from "@prisma/client";

// This type definition can stay here or be moved to a separate types file
const userWithSkills = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    skillsOffered: { include: { skill: true }, take: 3 },
    skillsWanted: { include: { skill: true }, take: 3 },
  },
});
export type UserWithSkills = Prisma.UserGetPayload<typeof userWithSkills>;

// The props for the page component should define the searchParams we expect
type HomePageProps = {
  searchParams: {
    query?: string;
    availability?: string;
  };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  // Destructure the properties from searchParams here
  const query = await searchParams.query || "";
  const availability = await searchParams.availability || "";

  // Build the Prisma query dynamically - this logic remains the same
  const users: UserWithSkills[] = await prisma.user.findMany({
    where: {
      isPublic: true,
      ...(availability && {
        availability: { contains: availability, mode: "insensitive" },
      }),
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          {
            skillsOffered: {
              some: { skill: { name: { contains: query, mode: "insensitive" } } },
            },
          },
        ],
      }),
    },
    include: {
      skillsOffered: { include: { skill: true }, take: 3 },
      skillsWanted: { include: { skill: true }, take: 3 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SearchAndFilterBar />
      <div className="container mx-auto px-4 py-8">
        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No Users Found</h2>
            <p className="text-muted-foreground mt-2">
              No profiles match your current search criteria.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
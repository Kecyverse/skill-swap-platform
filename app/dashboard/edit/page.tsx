// File: app/dashboard/edit/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// This is the main page component
export default async function DashboardEditPage() {
  const session = await getServerSession(authOptions);

  // If the user is not logged in, redirect them to the sign-in page
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch the current user's data, including all their skills
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skillsOffered: { include: { skill: true } },
      skillsWanted: { include: { skill: true } },
    },
  });

  if (!currentUser) {
    return <div>Error: Could not find user data.</div>;
  }
  
  // --- SERVER ACTIONS ---
  // These functions run securely on the server when called from a form

  async function updateProfile(formData: FormData) {
    "use server";
    await prisma.user.update({
      where: { id: session!.user!.id },
      data: {
        name: formData.get("name") as string,
        location: formData.get("location") as string,
        availability: formData.get("availability") as string,
      },
    });
    revalidatePath("/dashboard/edit"); // Refresh the page to show new data
  }

  async function addSkill(formData: FormData) {
    "use server";
    const skillName = formData.get("skillName") as string;
    const skillType = formData.get("skillType") as "offered" | "wanted";

    if (!skillName || !skillType) return;
    
    // Find or create the skill
    let skill = await prisma.skill.findFirst({ where: { name: { equals: skillName, mode: 'insensitive' } } });
    if (!skill) {
      skill = await prisma.skill.create({ data: { name: skillName } });
    }

    // Link the skill to the user
    const relationTable = skillType === 'offered' ? prisma.userSkillOffered : prisma.userSkillWanted;
    await relationTable.create({
      data: { userId: session!.user!.id, skillId: skill.id },
    });
    
    revalidatePath("/dashboard/edit");
  }

  async function removeSkill(skillId: number, skillType: 'offered' | 'wanted') {
    "use server";
    const relationTable = skillType === 'offered' ? prisma.userSkillOffered : prisma.userSkillWanted;
    await relationTable.delete({
      where: { userId_skillId: { userId: session!.user!.id, skillId: skillId } },
    });
    revalidatePath("/dashboard/edit");
  }


  // --- JSX / RENDERED CONTENT ---
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Manage Your Profile</h1>
      
      {/* Profile Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={currentUser.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={currentUser.location ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Input id="availability" name="availability" placeholder="e.g., Weekends, Evenings" defaultValue={currentUser.availability ?? ""} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Skills Offered Card */}
      <Card>
        <CardHeader>
          <CardTitle>Skills You Offer</CardTitle>
          <CardDescription>Let others know what you're good at.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentUser.skillsOffered.map(({ skill }) => (
              <Badge key={skill.id} className="flex items-center gap-1">
                {skill.name}
                <form action={removeSkill.bind(null, skill.id, 'offered')}>
                    <button type="submit" className="rounded-full hover:bg-destructive/20 p-0.5"><X size={12}/></button>
                </form>
              </Badge>
            ))}
          </div>
          <form action={addSkill} className="flex gap-2">
            <Input name="skillName" placeholder="Add a new skill..." required />
            <input type="hidden" name="skillType" value="offered" />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Skills Wanted Card */}
      <Card>
        <CardHeader>
          <CardTitle>Skills You Want</CardTitle>
          <CardDescription>What skills are you looking to learn?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
             {currentUser.skillsWanted.map(({ skill }) => (
              <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                {skill.name}
                 <form action={removeSkill.bind(null, skill.id, 'wanted')}>
                    <button type="submit" className="rounded-full hover:bg-destructive/20 p-0.5"><X size={12}/></button>
                </form>
              </Badge>
            ))}
          </div>
          <form action={addSkill} className="flex gap-2">
            <Input name="skillName" placeholder="Add a skill you want..." required />
            <input type="hidden" name="skillType" value="wanted" />
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
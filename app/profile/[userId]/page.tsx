type ProfilePageProps = {
  params: { userId: string };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Profile for User ID: {params.userId}</h1>
      <p className="text-muted-foreground">This page will publicly display a user's skills.</p>
    </div>
  );
}
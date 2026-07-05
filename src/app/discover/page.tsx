import Link from "next/link";
import type { Metadata } from "next";
import { CommunityNav } from "@/components/community/community-nav";
import { DiscoverSearch } from "@/components/community/discover-search";
import { ReportButton } from "@/components/community/report-button";
import { getDirectoryProfiles } from "@/lib/community";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Discover Creators — deckk.me",
  description:
    "Browse creators on deckk.me — artists, makers, and shops with public decks in the community directory.",
  openGraph: {
    title: "Discover Creators — deckk.me",
    description: "Find creators and explore their decks on deckk.me.",
  },
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const profiles = await getDirectoryProfiles(q);

  return (
    <>
      <CommunityNav active="discover" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Discover creators</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Creators who opted into the community directory. Search by name,
            handle, or bio.
          </p>
        </header>

        <div className="mb-8">
          <DiscoverSearch initialQuery={q} />
        </div>

        {profiles.length === 0 ? (
          <p className="rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground">
            {q
              ? `No creators match "${q}".`
              : "No creators in the directory yet."}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <article className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="size-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {profile.display_name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">
                        <Link
                          href={`/@${profile.handle}`}
                          className="hover:underline"
                        >
                          {profile.display_name}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        @{profile.handle}
                      </p>
                    </div>
                    <ReportButton
                      targetType="profile"
                      targetId={profile.id}
                      targetLabel={`@${profile.handle}`}
                    />
                  </div>
                  {profile.bio && (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {profile.bio}
                    </p>
                  )}
                  <Link
                    href={`/@${profile.handle}`}
                    className="mt-4 text-sm font-medium underline-offset-4 hover:underline"
                  >
                    View deck →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

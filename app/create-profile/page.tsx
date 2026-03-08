"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy } from "lucide-react";
import { request } from "@/lib/req";

const ROLE_TYPES = [
  // { value: "Owner", label: "Owner" },
  { value: "Member", label: "Member" },
] as const;

type RoleType = (typeof ROLE_TYPES)[number]["value"];

export default function CreateProfilePage() {
  return (
    <Suspense fallback={<PageShell>Loading profile form...</PageShell>}>
      <CreateProfileContent />
    </Suspense>
  );
}

function CreateProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams],
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleType>("Owner");
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const teamId = "430c1163-a2ea-48b2-ab31-161de8e75d22";

  const isOwner = role === "Owner";

  const copyTeamId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(teamId);
      setStatusMessage("Team ID copied.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Could not copy Team ID.");
    }
  }, [teamId]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setStatusMessage(null);

      if (!name.trim()) {
        setStatusMessage("Add a name to continue.");
        setIsSubmitting(false);
        return;
      }

      if (isOwner && !teamName.trim()) {
        setStatusMessage("The owner must name the team.");
        setIsSubmitting(false);
        return;
      }

      if (!isOwner && !teamCode.trim()) {
        setStatusMessage("Members must enter the team code.");
        setIsSubmitting(false);
        return;
      }

      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setStatusMessage("Your session expired. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      try {
        console.log(
          "sending profile payload:",
          userId,
          name,
          role,
          teamName,
          teamCode,
        );
        const response = await request("/profile/createProfile", "POST", {
          userId,
          username: name,
          teamrole: role,
          teamname: teamName,
          teamid: teamCode,
        });

        if (response.status == 201) {
          router.push("/dashboard");
        } else {
          setStatusMessage("Could not create the profile. Please try again.");
        }
      } catch (error) {
        console.error(error);
        setStatusMessage("Could not create the profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isOwner, name, presetEmail, role, teamCode, teamName, router],
  );

  return (
    <PageShell>
      <section className="w-full max-w-lg space-y-6">
        <header className="text-center">
          <p className="text-sm text-muted-foreground">
            Step 2 · Complete your profile
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-2">
              <span>Team ID:</span>
              <span className="font-mono text-foreground select-all">
                {teamId}
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={copyTeamId}
              disabled={!teamId}
            >
              <Copy className="size-4" />
              Copy ID
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set your role</h1>
          {presetEmail && (
            <p className="text-sm text-muted-foreground">
              Email: {presetEmail}
            </p>
          )}
        </header>

        <Card>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as RoleType)}
                >
                  <SelectTrigger size="default">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {ROLE_TYPES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isOwner ? (
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(event) => setTeamName(event.target.value)}
                    placeholder="e.g. Aurora Labs"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="team-code">Team code</Label>
                  <Input
                    id="team-code"
                    value={teamCode}
                    onChange={(event) => setTeamCode(event.target.value)}
                    placeholder="XXXXX-12345"
                  />
                </div>
              )}

              {statusMessage && (
                <p className="text-sm text-destructive">{statusMessage}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue to dashboard"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      {children}
    </main>
  );
}

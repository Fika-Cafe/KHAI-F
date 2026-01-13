"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, UserPlus, MoreVertical, Copy } from "lucide-react";
import { request } from "@/lib/req";

type ApiProfile = {
  id: string;
  name?: string;
  created_at?: string;
  permissions?: string;
};

type ApiMember = {
  id: string;
  team_id: string;
  profile_id: string;
  role: "Owner" | "Member";
  created_at: string;
  profile?: ApiProfile;
};

type ApiTeamResponse = {
  message?: string;
  team?: {
    id: string;
    name: string;
    created_at: string;
    owner_id: string;
    members: ApiMember[];
  };
};

const roleColors = {
  Owner: "default",
  Member: "secondary",
} as const;

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "Owner" | "Member">(
    "all"
  );
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [teamName, setTeamName] = useState("Team");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
  };

  const initialsFromMember = (member: ApiMember) => {
    const name = member.profile?.name ?? member.profile_id;
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const fetchMembers = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = (await request(
        `/teams/getTeam/${userId}`,
        "GET",
        {}
      )) as ApiTeamResponse;

      const team = response?.team;
      setTeamName(team?.name ?? "Team");
      setTeamId(team?.id ?? null);
      const members = Array.isArray(team?.members) ? team?.members ?? [] : [];
      setMembers(members);
    } catch (err) {
      console.error("Error fetching team members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyTeamId = async () => {
    if (!teamId || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(teamId);
    } catch (err) {
      console.error("Failed to copy team id", err);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesRole = filterRole === "all" || member.role === filterRole;
    const query = searchQuery.toLowerCase();
    const candidateValues = [
      member.profile?.name ?? "",
      member.profile_id ?? "",
      member.profile?.permissions ?? "",
    ];
    const matchesQuery = candidateValues.some((value) =>
      value.toLowerCase().includes(query)
    );
    return matchesRole && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            {teamName}
          </h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
          </p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-2">
              <span>Team ID:</span>
              <span className="font-mono text-foreground">{teamId ?? "-"}</span>
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
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={fetchMembers}
          disabled={loading}
        >
          <UserPlus className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={filterRole}
          onValueChange={(value) => setFilterRole(value as typeof filterRole)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="Owner">Owner</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members List */}
      <Card className="border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Cargando miembros...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No members found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initialsFromMember(member)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {member.profile?.name ?? member.profile_id}
                        </h3>
                        <Badge
                          variant={roleColors[member.role]}
                          className="text-xs"
                        >
                          {member.role}
                        </Badge>
                        {member.profile?.permissions ? (
                          <Badge variant="outline" className="text-xs">
                            {member.profile.permissions}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Member since {formatDate(member.created_at)}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          ID: {member.profile_id}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Change role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

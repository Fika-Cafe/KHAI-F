"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, LinkIcon, Clock, Filter } from "lucide-react";
import { request } from "@/lib/req";

type SearchLog = {
  id: string;
  query: string;
  created_at: string;
  results: Array<{
    id: string;
    result_type: "document" | "links";
    document: { id: string; title: string; created_at: string } | null;
    links: {
      id: string;
      title: string;
      url: string;
      created_at: string;
    } | null;
  }>;
};

type DocumentResult = { id: string; title: string; created_at: string };
type LinkResult = {
  id: string;
  title: string;
  url: string;
  created_at: string;
};

const fetchSearchLogs = async (userId: string) => {
  const response = await request(`/search/logs/${userId}`, "GET", {});
  const data = (response as any)?.data ?? response;
  return (data as { message?: string; logs?: SearchLog[] })?.logs ?? [];
};

const fetchSearch = async (userId: string, query: string) => {
  const response = await request(`/search/query/${userId}`, "POST", { query });
  const data = (response as any)?.data ?? response;
  return (
    (data as {
      query?: string;
      documents?: DocumentResult[];
      links?: LinkResult[];
    }) ?? { documents: [], links: [] }
  );
};

export function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [fileType, setFileType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [documents, setDocuments] = useState<DocumentResult[]>([]);
  const [links, setLinks] = useState<LinkResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    setUserId(storedUserId);

    if (storedUserId) {
      setLoadingLogs(true);
      fetchSearchLogs(storedUserId)
        .then((logsData) => setLogs(logsData || []))
        .finally(() => setLoadingLogs(false));
    }
  }, []);

  useEffect(() => {
    if (userId && initialQuery) {
      handleSearch(initialQuery, userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSearch = async (searchQuery: string, currentUserId: string) => {
    setLoadingSearch(true);
    try {
      const data = await fetchSearch(currentUserId, searchQuery);
      setDocuments(data.documents || []);
      setLinks(data.links || []);
    } finally {
      setLoadingSearch(false);
    }
  };

  const combinedResults = [
    ...documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: "document" as const,
      source: "Document",
      created_at: doc.created_at,
    })),
    ...links.map((link) => ({
      id: link.id,
      title: link.title,
      type: "link" as const,
      source: link.url,
      created_at: link.created_at,
    })),
  ];

  const uniqueQueries = [...new Set(logs.map((log) => log.query))];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find documents, links, and information across your knowledge base
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for anything..."
            className="pl-10 pr-4 h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          size="lg"
          className="px-8"
          disabled={!userId || !query || loadingSearch}
          onClick={() => userId && handleSearch(query, userId)}
        >
          Search
        </Button>
      </div>

      {/* Recent Queries (chips) */}
      {uniqueQueries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uniqueQueries.map((q) => (
            <Button
              key={q}
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery(q);
                if (userId) handleSearch(q, userId);
              }}
              disabled={loadingSearch || !userId}
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="size-4 text-muted-foreground" />
        <Select value={fileType} onValueChange={setFileType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="link">Links</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="day">Last 24 hours</SelectItem>
            <SelectItem value="week">Last week</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      {(documents.length > 0 || links.length > 0) && (
        <div className="text-sm text-muted-foreground">
          Found{" "}
          <span className="font-medium text-foreground">
            {documents.length + links.length} results
          </span>{" "}
          for "{query}"
        </div>
      )}

      {/* Results List */}
      <div className="space-y-3">
        {loadingSearch && (
          <div className="text-sm text-muted-foreground">Searching...</div>
        )}
        {!loadingSearch && combinedResults.length === 0 && (
          <div className="text-sm text-muted-foreground">No results yet</div>
        )}
        {combinedResults.map((result) => (
          <Card
            key={result.id}
            className="border-border hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  {result.type === "link" ? (
                    <LinkIcon className="size-6 text-muted-foreground" />
                  ) : (
                    <FileText className="size-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {result.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium">{result.source}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>
                        {new Date(result.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span>•</span>
                    <span className="text-chart-2 font-medium capitalize">
                      {result.type}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Logs */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="size-4" />
          Recent searches
        </div>
        {loadingLogs && (
          <div className="text-sm text-muted-foreground">Loading logs...</div>
        )}
        {!loadingLogs && logs.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No recent searches
          </div>
        )}
        {logs.map((log) => (
          <Card key={log.id} className="border-border">
            <CardContent className="p-4 space-y-2">
              {log.results.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()} — no results
                </div>
              )}
              {log.results.map((res) => {
                const title =
                  res.document?.title || res.links?.title || "Untitled";
                return (
                  <div
                    key={res.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-foreground line-clamp-1">
                      {title}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

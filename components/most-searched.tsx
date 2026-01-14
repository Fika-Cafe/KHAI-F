"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/req";

type ApiDocument = {
  id: string;
  title?: string;
  count?: number;
  profile?: {
    id?: string;
    name?: string;
  };
};

type MostViewed = {
  id: string;
  title: string;
  count: number;
  owner: string;
};

const dedupeById = <T extends { id: string }>(items: T[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

export function MostSearched() {
  const [items, setItems] = useState<MostViewed[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMostViewed = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      setLoading(true);
      try {
        const response = await request(
          `/dashboard/mostViewedDocuments/${userId}`,
          "GET",
          {}
        );

        const docsRaw: ApiDocument[] = Array.isArray(response.documents)
          ? response.documents.filter(
              (doc: ApiDocument | null | undefined): doc is ApiDocument =>
                !!doc && typeof doc.id === "string"
            )
          : [];

        const normalized = dedupeById<MostViewed>(
          docsRaw.map((doc) => ({
            id: doc.id,
            title: doc.title || "Untitled document",
            count: Number.isFinite(doc.count) ? Number(doc.count) : 0,
            owner: doc.profile?.name || doc.profile?.id || "N/A",
          }))
        ).sort((a, b) => b.count - a.count);

        setItems(normalized);
      } catch (error) {
        console.error("Error loading most viewed documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewed();
  }, []);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Most Viewed Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading most viewed documents...
          </p>
        ) : null}

        {!loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No most viewed documents available.
          </p>
        ) : null}

        {items.map((doc, index) => (
          <Link key={doc.id} href={`/document/${doc.id}`}>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-medium text-muted-foreground w-6">
                  {index + 1}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-foreground line-clamp-1">
                    {doc.title}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {doc.owner}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-muted-foreground">
                  {doc.count} views
                </span>
                <TrendingUp className="size-4 text-chart-2" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

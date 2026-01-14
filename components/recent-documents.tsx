"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, LinkIcon, Clock } from "lucide-react";
import Link from "next/link";
import { request } from "@/lib/req";

type ApiDocument = {
  id: string;
  title?: string;
  created_at?: string;
};

type ApiLink = {
  id: string;
  title?: string;
  url?: string;
  created_at?: string;
};

type RecentItem = {
  id: string;
  title: string;
  createdAt: string;
  type: "document" | "link";
  url?: string;
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
};

const getHostname = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (err) {
    return "";
  }
};

const dedupeById = <T extends { id: string }>(items: T[]) =>
  Array.from(new Map(items.map((item) => [item.id, item])).values());

export function RecentDocuments() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      setLoading(true);

      try {
        const response = await request(
          `/dashboard/recentDocuments/${userId}`,
          "GET",
          {}
        );

        const documentsRaw = Array.isArray(response.documents)
          ? response.documents
          : [];
        const linksRaw = Array.isArray(response.links) ? response.links : [];

        const flatten = (input: unknown[]) =>
          input.reduce<unknown[]>((acc, curr) => {
            if (Array.isArray(curr)) {
              acc.push(...curr.filter(Boolean));
            } else if (curr) {
              acc.push(curr);
            }
            return acc;
          }, []);

        const documentItems = dedupeById(
          flatten(documentsRaw)
            .filter((item): item is ApiDocument => {
              return !!item && typeof (item as ApiDocument).id === "string";
            })
            .map((doc) => ({
              id: doc.id,
              title: doc.title || "Documento sin título",
              createdAt: doc.created_at ?? "",
              type: "document" as const,
            }))
        );

        const linkItems = dedupeById(
          flatten(linksRaw)
            .filter((item): item is ApiLink => {
              return !!item && typeof (item as ApiLink).id === "string";
            })
            .map((link) => ({
              id: link.id,
              title: link.title || link.url || "Enlace sin título",
              createdAt: link.created_at ?? "",
              type: "link" as const,
              url: link.url,
            }))
        );

        const merged = [...documentItems, ...linkItems].sort((a, b) => {
          const aTime = Date.parse(a.createdAt || "");
          const bTime = Date.parse(b.createdAt || "");

          if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
          if (Number.isNaN(aTime)) return 1;
          if (Number.isNaN(bTime)) return -1;
          return bTime - aTime;
        });

        setItems(merged);
      } catch (error) {
        console.error("Error loading recent documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentDocuments();
  }, []);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Cargando documentos recientes...
          </p>
        ) : null}

        {!loading && items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay documentos o enlaces recientes.
          </p>
        ) : null}

        {items.map((item) => {
          const content = (
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="size-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                {item.type === "link" ? (
                  <LinkIcon className="size-5 text-muted-foreground" />
                ) : (
                  <FileText className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{item.type}</span>
                  {item.type === "link" && getHostname(item.url) ? (
                    <>
                      <span>•</span>
                      <span>{getHostname(item.url)}</span>
                    </>
                  ) : null}
                  {item.createdAt ? (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );

          return item.type === "link" && item.url ? (
            <a
              key={`${item.type}-${item.id}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              {content}
            </a>
          ) : (
            <Link key={`${item.type}-${item.id}`} href={`/document/${item.id}`}>
              {content}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

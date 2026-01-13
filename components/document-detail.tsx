"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FileText,
  Download,
  Share2,
  MoreHorizontal,
  Clock,
  User,
  Tag,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { request } from "@/lib/req";

interface DocumentDetailProps {
  documentId: string;
}

type RemoteDocument = {
  id: string;
  title: string;
  source?: string;
  content?: string;
  content_sha?: string;
  file_size?: number;
  created_at?: string;
  profile_id?: string;
  profile?: { name?: string };
};

const extractDocument = (res: any): RemoteDocument | null => {
  const candidates = [
    res,
    res?.data,
    res?.document,
    res?.data?.document,
    res?.document?.document,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      const firstWithId = candidate.find((item) => item?.id);
      if (firstWithId) return firstWithId as RemoteDocument;
    } else if (candidate.id) {
      return candidate as RemoteDocument;
    }
  }

  return null;
};

const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const base64ToObjectUrl = (base64?: string, mime?: string) => {
  if (!base64) return null;
  try {
    // Some backends return base64 with newlines/spaces; strip them to avoid atob errors.
    const normalized = base64.replace(/\s/g, "");
    const binary = atob(normalized);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime ?? "application/pdf" });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to decode base64", error);
    return null;
  }
};

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  const [doc, setDoc] = useState<RemoteDocument | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await request(
          `/docs/document/${documentId}`,
          "GET",
          {}
        );
        const found = extractDocument(response);
        if (!found?.id) {
          throw new Error(response?.message ?? "Documento no encontrado");
        }
        if (!cancelled) setDoc(found);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message ?? "No se pudo cargar el documento");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDoc();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  useEffect(() => {
    if (!doc?.content) {
      setObjectUrl(null);
      return;
    }
    const url = base64ToObjectUrl(doc.content, doc.source ?? "application/pdf");
    setObjectUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc?.content, doc?.source]);

  const ownerName = useMemo(
    () => doc?.profile?.name ?? "Sin propietario",
    [doc?.profile]
  );
  const ownerInitials = useMemo(() => {
    const name = doc?.profile?.name ?? "Sin propietario";
    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "SP"
    );
  }, [doc?.profile]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Cargando documento...</p>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!doc) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="size-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {doc.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{doc.source ?? "Documento"}</Badge>
              <span>•</span>
              <span>{formatBytes(doc.file_size)}</span>
              <span>•</span>
              <span>{formatDate(doc.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {objectUrl ? (
            <Button asChild className="gap-2">
              <a href={objectUrl} download={doc.title || "document"}>
                <Download className="size-4" />
                Download
              </a>
            </Button>
          ) : (
            <Button className="gap-2" disabled>
              <Download className="size-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Descripción
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {doc.title || "Documento sin título"}
                </p>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Vista previa
                </h2>
                {objectUrl ? (
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/40">
                    <iframe src={objectUrl} className="w-full h-[70vh]" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay contenido para mostrar.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner Info */}
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="size-4" />
                  Owner
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {ownerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {ownerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.profile?.name ?? ""}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="size-4" />
                  Timeline
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {formatDate(doc.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground">
                      {formatBytes(doc.file_size)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="size-4" />
                  Metadata
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>ID: {doc.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

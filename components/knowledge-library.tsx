"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Search,
  Grid3x3,
  List,
  Upload,
  FolderOpen,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UploadModal } from "@/components/upload-modal";
import { request } from "@/lib/req";

type ApiDocument = {
  id: string;
  title: string;
  source: string;
  content: string;
  content_sha: string;
  profile_id: string;
  file_size: number;
  created_at: string;
  profile?: {
    id: string;
    name?: string;
    created_at?: string;
    permissions?: string;
  };
};

type LibraryDocument = {
  id: string;
  title: string;
  fileType: string;
  size: string;
  owner: string;
  lastModified: string;
};

type ApiLink = {
  id: string;
  title: string;
  url: string;
  profile_id: string;
  created_at: string;
  profile?: {
    id: string;
    name?: string;
    created_at?: string;
    permissions?: string;
  };
};

type LibraryLink = {
  id: string;
  title: string;
  url: string;
  host: string;
  owner: string;
  createdAt: string;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes || Number.isNaN(bytes)) return "-";
  const sizes = ["B", "KB", "MB", "GB"];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < sizes.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${sizes[i]}`;
};

const formatMimeType = (mime?: string) => {
  if (!mime) return "-";
  const [, subtype] = mime.split("/");
  return (subtype ?? mime).toUpperCase();
};

const getHostname = (url?: string) => {
  if (!url) return "-";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (err) {
    return url;
  }
};

const formatDate = (date?: string) => {
  if (!date) return "-";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
};

const normalizeDocuments = (docs: ApiDocument[]): LibraryDocument[] =>
  docs.map((doc) => ({
    id: doc.id,
    title: doc.title || "Untitled document",
    fileType: formatMimeType(doc.source),
    size: formatFileSize(doc.file_size),
    owner: doc.profile?.name ?? doc.profile_id ?? "N/A",
    lastModified: formatDate(doc.created_at),
  }));

const normalizeLinks = (items: ApiLink[]): LibraryLink[] =>
  items.map((link) => ({
    id: link.id,
    title: link.title || link.url || "Untitled link",
    url: link.url,
    host: getHostname(link.url),
    owner: link.profile?.name ?? link.profile_id ?? "N/A",
    createdAt: formatDate(link.created_at),
  }));

export function KnowledgeLibrary() {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [links, setLinks] = useState<LibraryLink[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [contentTab, setContentTab] = useState<"documents" | "links">(
    "documents"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get documents from the API
    const fetchDocuments = async () => {
      const userId = localStorage.getItem("user_id");

      setLoading(true);
      try {
        const response = await request(
          `/docs/myDocuments/${userId}`,
          "GET",
          {}
        );
        const docs = Array.isArray(response.document) ? response.document : [];
        setDocuments(normalizeDocuments(docs));
      } catch (error) {
        console.error("Error loading documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();

    // Get links from the API
    const fetchLinks = async () => {
      const userId = localStorage.getItem("user_id");

      setLoading(true);
      try {
        const response = await request(`/docs/myLinks/${userId}`, "GET", {});
        const items = Array.isArray(response.links) ? response.links : [];
        setLinks(normalizeLinks(items));
      } catch (error) {
        console.error("Error loading links", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  const filteredDocuments = documents
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "owner") return a.owner.localeCompare(b.owner);
      if (sortBy === "size") return a.size.localeCompare(b.size);
      return 0;
    });

  const filteredLinks = links
    .filter((link) =>
      [link.title, link.host, link.owner].some((value) =>
        value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "owner") return a.owner.localeCompare(b.owner);
      // recent by created date is handled by default
      return 0;
    });

  const sortOptions =
    contentTab === "documents"
      ? [
          { value: "recent", label: "Recently modified" },
          { value: "title", label: "Title A-Z" },
          { value: "owner", label: "Owner" },
          { value: "size", label: "File size" },
        ]
      : [
          { value: "recent", label: "Recently added" },
          { value: "title", label: "Title A-Z" },
          { value: "owner", label: "Owner" },
        ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Knowledge Library
          </h1>
          <p className="text-muted-foreground">
            Browse and manage your company documents and links
          </p>
        </div>
        <Button className="gap-2" onClick={() => setUploadModalOpen(true)}>
          <Upload className="size-4" />
          Upload Document
        </Button>
      </div>

      {/* Content type tabs */}
      <Tabs
        value={contentTab}
        onValueChange={(val) => setContentTab(val as "documents" | "links")}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search library..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "grid" | "list")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="grid" className="gap-2">
              <Grid3x3 className="size-4" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="size-4" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <FolderOpen className="size-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {documents.length}
          </span>
          <span className="text-muted-foreground">documents</span>
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{links.length}</span>
          <span className="text-muted-foreground">links</span>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      ) : null}

      {/* Documents / Links content */}
      {contentTab === "documents" ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/document/${doc.id}`}>
                <Card className="border-border hover:bg-accent/50 transition-colors h-full cursor-pointer">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="size-12 bg-muted rounded-lg flex items-center justify-center">
                        <FileText className="size-6 text-muted-foreground" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {doc.fileType}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>By {doc.owner}</p>
                        <p>
                          {doc.size} • {doc.lastModified}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <Link key={doc.id} href={`/document/${doc.id}`}>
                <Card className="border-border hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="size-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {doc.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {doc.fileType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.owner}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.lastModified}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((link) => (
            <Card
              key={link.id}
              className="border-border hover:bg-accent/50 transition-colors h-full"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="size-12 bg-muted rounded-lg flex items-center justify-center">
                    <Link2 className="size-6 text-muted-foreground" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {link.host}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                    {link.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {link.url}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {link.owner} • {link.createdAt}
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <a href={link.url} target="_blank" rel="noreferrer">
                    Open link
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLinks.map((link) => (
            <Card
              key={link.id}
              className="border-border hover:bg-accent/50 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="size-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Link2 className="size-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {link.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {link.host}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {link.url}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{link.owner}</span>
                      <span>•</span>
                      <span>{link.createdAt}</span>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="shrink-0">
                    <a href={link.url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}

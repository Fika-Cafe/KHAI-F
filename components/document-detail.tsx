"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Download, Share2, MoreHorizontal, Clock, User, Tag, ExternalLink, MessageSquare } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface DocumentDetailProps {
  documentId: string
}

export function DocumentDetail({ documentId }: DocumentDetailProps) {
  // Mock document data
  const document = {
    id: documentId,
    title: "Q4 Product Roadmap 2024",
    type: "PDF",
    size: "2.4 MB",
    owner: {
      name: "Sarah Chen",
      email: "sarah@acme.com",
      initials: "SC",
    },
    created: "Nov 15, 2024",
    modified: "2 days ago",
    tags: ["product", "roadmap", "planning", "Q4"],
    description:
      "Comprehensive product roadmap for Q4 2024 including feature releases, timeline, resource allocation, and key milestones. This document outlines the strategic priorities and deliverables for the product team.",
    content: `# Q4 Product Roadmap 2024

## Overview
This document outlines the key initiatives and deliverables for Q4 2024.

## Key Features
1. **User Dashboard Redesign** - Complete overhaul of the user interface
2. **API v3 Launch** - New RESTful API with improved performance
3. **Mobile App Beta** - Initial release for iOS and Android
4. **Analytics Platform** - Real-time data visualization tools

## Timeline
- October: Planning & Design Phase
- November: Development Sprint 1-2
- December: Testing & Launch

## Resources
- Engineering Team: 8 developers
- Design Team: 3 designers
- Product Management: 2 PMs

## Success Metrics
- User engagement: +25%
- API response time: <100ms
- Mobile downloads: 10,000+`,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="size-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <FileText className="size-7 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold text-foreground mb-2">{document.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{document.type}</Badge>
              <span>•</span>
              <span>{document.size}</span>
              <span>•</span>
              <span>Modified {document.modified}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Share2 className="size-4" />
            Share
          </Button>
          <Button className="gap-2">
            <Download className="size-4" />
            Download
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageSquare className="size-4 mr-2" />
                Ask AI about this
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="size-4 mr-2" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{document.description}</p>

              <Separator className="my-6" />

              <h2 className="text-lg font-semibold text-foreground mb-4">Document Preview</h2>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                  {document.content}
                </pre>
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
                      {document.owner.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{document.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{document.owner.email}</p>
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
                    <span className="text-foreground">{document.created}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modified</span>
                    <span className="text-foreground">{document.modified}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Tag className="size-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Actions */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">AI Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm bg-transparent" size="sm">
                  <MessageSquare className="size-4 mr-2" />
                  Ask questions about this
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm bg-transparent" size="sm">
                  <FileText className="size-4 mr-2" />
                  Summarize content
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Cloud, Check, AlertCircle } from "lucide-react";
import { uploadRequest, request } from "@/lib/req";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUserId = localStorage.getItem("user_id");
    if (savedUserId) setUserId(savedUserId);
  }, []);

  const uploadFiles = async () => {
    if (!userId || selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append("file", selectedFiles[0]);

    await uploadRequest(`/docs/upload/${userId}`, formData);
  };

  const handleUpload = async () => {
    if (!userId || selectedFiles.length === 0) return;

    uploadFiles();

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setSelectedFiles([]);
            onOpenChange(false);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };
  const handleLinkSubmit = async () => {
    if (!userId) return;

    await request(`/docs/uploadLink/${userId}`, "POST", {
      url: linkUrl,
      title: linkTitle,
    });

    setLinkUrl("");
    setLinkTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add to Knowledge Library</DialogTitle>
          <DialogDescription>
            Upload files, add links, or connect cloud storage providers
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="link">Add Link</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.md"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <Upload className="size-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Choose files to upload
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or drag and drop files here
                  <br />
                  PDF, DOC, DOCX, TXT, MD up to 5MB
                </p>
                <Button type="button" variant="outline">
                  Browse Files
                </Button>
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-accent rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-muted rounded flex items-center justify-center">
                          <Upload className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {uploadProgress > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {uploadProgress}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {isUploading && (
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                  <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Files will be processed and indexed by our AI. This may take
                    a few minutes depending on file size.
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-title">Título</Label>
                <Input
                  id="link-title"
                  type="text"
                  placeholder="Ejemplo"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://docs.example.com/page"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We'll fetch and index the content from this URL. Make sure the
                  page is publicly accessible or you have permission to access
                  it.
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleLinkSubmit}
                disabled={!linkUrl || !linkTitle}
              >
                Add Link
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

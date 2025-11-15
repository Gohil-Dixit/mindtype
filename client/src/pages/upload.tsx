import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, FileText, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function UploadContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const uploadMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; sourceType: string }) => {
      return await apiRequest("POST", "/api/content/upload", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Content uploaded",
        description: "Your custom text has been saved successfully.",
      });
      setTimeout(() => setLocation("/"), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    },
  });

  const handlePasteSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      sourceType: "paste",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const fileTitle = title.trim() || file.name.replace(".txt", "");
      
      uploadMutation.mutate({
        title: fileTitle,
        content: text,
        sourceType: "file",
      });
    };
    reader.readAsText(file);
  };

  const [selectedDriveFile, setSelectedDriveFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const driveImportMutation = useMutation({
    mutationFn: async (data: { fileId: string; title: string }) => {
      return await apiRequest("POST", "/api/content/import-drive", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Content imported",
        description: "Your Google Drive file has been imported successfully.",
      });
      setTimeout(() => setLocation("/"), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import from Google Drive",
        variant: "destructive",
      });
    },
  });

  const handleDriveImport = () => {
    if (!selectedDriveFile) {
      toast({
        title: "No file selected",
        description: "Please select a file from Google Drive.",
        variant: "destructive",
      });
      return;
    }

    driveImportMutation.mutate({
      fileId: selectedDriveFile.id,
      title: selectedDriveFile.name.replace(/\.(txt|doc|docx)$/, ""),
    });
  };

  const charCount = content.length;
  const wordCount = countWords(content);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-mono font-semibold text-foreground">
            Upload Custom Text
          </h1>
          <p className="text-muted-foreground mt-2">
            Add your own content for typing practice
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="paste" data-testid="tab-paste">
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="file" data-testid="tab-file">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="drive" data-testid="tab-drive">
              <HardDrive className="w-4 h-4 mr-2" />
              Google Drive
            </TabsTrigger>
          </TabsList>

          <div className="border border-border rounded-xl p-8 bg-card">
            <TabsContent value="paste" className="space-y-6 mt-0">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Content Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Shakespeare Sonnet 18"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 bg-background border-input"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Text Content
                </label>
                <Textarea
                  placeholder="Paste your custom text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] font-mono text-base bg-background border-input resize-none"
                  data-testid="textarea-content"
                />
                <div className="flex justify-end gap-4 text-sm text-muted-foreground">
                  <span>{charCount} characters</span>
                  <span>{wordCount} words</span>
                </div>
              </div>

              <Button
                onClick={handlePasteSubmit}
                disabled={!title.trim() || !content.trim() || uploadMutation.isPending}
                className="w-full h-12 text-base"
                data-testid="button-create-test"
              >
                {uploadMutation.isPending ? "Creating..." : "Create Test"}
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-6 mt-0">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Content Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g., My Custom Text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 bg-background border-input"
                  data-testid="input-file-title"
                />
              </div>

              <div
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-foreground/30 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground mb-2">Drag .txt file or click to browse</p>
                <p className="text-sm text-muted-foreground">Accepted formats: .txt only</p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-file-upload"
                />
              </div>

              {uploadMutation.isPending && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground animate-pulse">Uploading...</div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="drive" className="space-y-6 mt-0">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <HardDrive className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Google Drive Integration
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import text files directly from your Google Drive
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    File ID (from Drive URL)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 1abc...xyz"
                    value={selectedDriveFile?.id || ""}
                    onChange={(e) =>
                      setSelectedDriveFile({
                        id: e.target.value,
                        name: "Google Drive File",
                      })
                    }
                    className="h-12 bg-background border-input font-mono text-sm"
                    data-testid="input-drive-file-id"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy the file ID from your Google Drive file URL
                  </p>
                </div>

                <Button
                  onClick={handleDriveImport}
                  disabled={!selectedDriveFile?.id || driveImportMutation.isPending}
                  className="w-full h-12 text-base"
                  data-testid="button-import-drive"
                >
                  {driveImportMutation.isPending ? "Importing..." : "Import from Drive"}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

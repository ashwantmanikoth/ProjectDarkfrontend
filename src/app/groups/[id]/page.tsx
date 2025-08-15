"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { uploadPDF, uploadPDFStream } from "../../../utils/api";
import ProtectedRoute from "../../../components/ProtectedRoute";
import AppLayout from "../../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Document, Group } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { 
  Trash2, 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  MessageSquare,
  Search,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { Backdrop } from "@/components/ui/backdrop";

const GroupPage = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id as string;
  
  // Debug URL information
  console.log("GroupPage - window.location.pathname:", typeof window !== 'undefined' ? window.location.pathname : 'server-side');
  console.log("GroupPage - router.asPath:", router);
  
  // Debug logging
  console.log("GroupPage - params:", params);
  console.log("GroupPage - params type:", typeof params);
  console.log("GroupPage - params.id:", params?.id);
  console.log("GroupPage - groupId:", groupId);
  console.log("GroupPage - groupId type:", typeof groupId);
  console.log("GroupPage - groupId === 'undefined':", groupId === 'undefined');
  
  const [group, setGroup] = useState<Group | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [processingDocuments, setProcessingDocuments] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [searchDocuments, setSearchDocuments] = useState<any[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  // Debug useEffect to check params on mount
  useEffect(() => {
    console.log("Component mounted - params:", params);
    console.log("Component mounted - groupId:", groupId);
    console.log("Component mounted - typeof groupId:", typeof groupId);
    console.log("Component mounted - groupId === 'undefined':", groupId === 'undefined');
    console.log("Component mounted - groupId === undefined:", groupId === undefined);
  }, []);

  // Debug useEffect to track groupId changes
  useEffect(() => {
    console.log("groupId changed - new value:", groupId);
    console.log("groupId changed - type:", typeof groupId);
    console.log("groupId changed - === 'undefined':", groupId === 'undefined');
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      console.log("Fetching group with ID:", groupId);
      const response = await fetch(`/api/groups/${groupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch group");
      }
      const data = await response.json();
      setGroup(data);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching group:", error);
      toast.error("Failed to load group");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect - status:", status);
    console.log("useEffect - groupId:", groupId);
    console.log("useEffect - params:", params);
    
    if (status === "authenticated" && groupId && groupId !== "undefined") {
      console.log("Fetching group data for groupId:", groupId);
      fetchGroup();
    } else {
      console.log("useEffect - Not fetching group data. Conditions not met:");
      console.log("  - status === 'authenticated':", status === "authenticated");
      console.log("  - groupId exists:", !!groupId);
      console.log("  - groupId !== 'undefined':", groupId !== "undefined");
    }
  }, [status, groupId, params]);

  useEffect(() => {
    if (processingDocuments.size === 0 || !groupId || groupId === "undefined") return;

    console.log("Setting up polling for groupId:", groupId);
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/documents?groupId=${groupId}`);
        if (!response.ok) throw new Error("Failed to fetch documents");
        const updatedDocs = await response.json();
        
        setDocuments(updatedDocs);
        
        const stillProcessing = updatedDocs
          .filter(doc => processingDocuments.has(doc.id) && doc.status === "processing")
          .map(doc => doc.id);
        
        setProcessingDocuments(new Set(stillProcessing));
        
        if (stillProcessing.length === 0) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error("Error polling documents:", error);
        clearInterval(pollInterval);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [processingDocuments, groupId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    console.log("handleFileChange - groupId:", groupId);
    console.log("handleFileChange - groupId type:", typeof groupId);
    console.log("handleFileChange - groupId === 'undefined':", groupId === 'undefined');

    if (!groupId || groupId === "undefined") {
      console.error("handleFileChange - Invalid groupId:", groupId);
      toast.error("Invalid group ID");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let newDoc: any = null;

    try {
      console.log("Uploading file for groupId:", groupId);
      
      // Create document record with processing status
      const createResponse = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedFile.name,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          status: "processing",
          groupId: groupId,
        }),
      });

      if (!createResponse.ok) {
        console.log("Failed to create document record");
        throw new Error("Failed to create document record");
      }

      newDoc = await createResponse.json();
      
      // Add to list and mark as processing
      setDocuments(prev => [...prev, newDoc]);
      setProcessingDocuments(prev => new Set([...prev, newDoc.id]));

      // Choose upload method based on file size
      const isLargeFile = selectedFile.size > 10 * 1024 * 1024; // 10MB threshold
      if (isLargeFile) {
        console.log("isLargeFile:");

        console.log("Using streaming upload for large file");
        await uploadPDFStream(
          selectedFile, 
          newDoc.id, 
          groupId,
          (progress) => {
            setUploadProgress(progress);
            console.log(`Upload progress: ${progress}%`);
          }
        );
      } else {
        console.log("Using regular upload for small file");
        await uploadPDF(selectedFile, newDoc.id, groupId);
      }

      // Set up SSE connection for processing updates
      const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_FLASK_URL}/stream`);
      
      eventSource.onmessage = (event) => {
        const update = JSON.parse(event.data);
        
        // Only process updates for this document
        if (update.document_id === newDoc.id) {
          console.log("Received SSE update:", update);
          
          // Update document status in the list
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id 
              ? { 
                  ...doc, 
                  status: update.status,
                  filePath: update.data?.file_path,
                  pageCount: update.data?.page_count,
                }
              : doc
          ));

          // Remove from processing set if status is final
          if (["processed", "failed"].includes(update.status)) {
            setProcessingDocuments(prev => {
              const newSet = new Set(prev);
              newSet.delete(newDoc.id);
              return newSet;
            });
            
            // Close SSE connection for this document
            eventSource.close();
          }

          // Show status toasts
          if (update.status === "processing") {
            toast.info(update.message || "Processing document...");
          } else if (update.status === "processed") {
            toast.success("Document processed successfully!");
          } else if (update.status === "failed") {
            toast.error(update.message || "Failed to process document");
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
      };

      toast.success("File uploaded successfully! Processing in background...");

    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      
      // Remove from processing if upload failed
      if (newDoc) {
        setProcessingDocuments(prev => {
          const newSet = new Set(prev);
          newSet.delete(newDoc.id);
          return newSet;
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setIsUploadModalOpen(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!groupId || groupId === "undefined") {
      toast.error("Invalid group ID");
      return;
    }

    setIsAsking(true);
    try {
      console.log("Asking question for groupId:", groupId);
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: question,
          groupId: groupId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer");
      }

      const data = await response.json();
      setAnswer(data.answer || "No answer found");
      setSearchSources(data.sources || []);
      setSearchDocuments(data.documents || []);
    } catch (error) {
      console.error("Error asking question:", error);
      toast.error("Failed to get answer");
    } finally {
      setIsAsking(false);
    }
  };

  if (status === "loading" || isLoading || !params || !params.id) {
    console.log("Loading state - status:", status, "isLoading:", isLoading, "params:", params, "params.id:", params?.id);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Guard against undefined groupId
  if (!groupId || groupId === "undefined") {
    console.log("GroupPage - Redirecting due to invalid groupId:", groupId);
    console.log("GroupPage - groupId type:", typeof groupId);
    console.log("GroupPage - groupId === 'undefined':", groupId === 'undefined');
    console.log("GroupPage - groupId === undefined:", groupId === undefined);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Invalid Group</h2>
          <p className="text-muted-foreground mb-4">Group ID is missing or invalid: {String(groupId)}</p>
          <Button onClick={() => router.push("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Group not found</h2>
          <Button onClick={() => router.push("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-muted-foreground mt-1">{group.description}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsQuestionModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>

          {/* Documents Section */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Documents ({documents.length})</CardTitle>
                </div>
                <Badge variant="secondary">
                  {documents.filter(doc => doc.status === "processed").length} processed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Pages</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-accent/50 transition-colors">
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {doc.title}
                        </TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</TableCell>
                        <TableCell>{doc.pageCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doc.status === "processed"
                                ? "success"
                                : doc.status === "processing"
                                ? "secondary"
                                : "destructive"
                            }
                            className="flex items-center gap-1"
                          >
                            {doc.status === "processed" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : doc.status === "processing" ? (
                              <Clock className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your first document to start asking questions about this topic.
                  </p>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <Backdrop>
              <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-border/50 transition-all duration-200 scale-100 dark:shadow-2xl dark:shadow-black/20">
                <h2 className="text-xl font-semibold mb-4">Upload Document to {group.name}</h2>
                <div className="space-y-4">
                  {!isUploading ? (
                    <>
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="file-upload"
                          className="w-full flex flex-col items-center px-4 py-6 bg-accent text-accent-foreground rounded-lg shadow-lg tracking-wide border border-border cursor-pointer hover:bg-accent/90 transition-colors"
                        >
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="mt-2 text-base">Select a PDF file</span>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsUploadModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          Upload
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-sm text-muted-foreground mb-2">Uploading document...</p>
                        {uploadProgress > 0 && (
                          <div className="w-full bg-secondary rounded-full h-2 mb-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {uploadProgress > 0 ? `${uploadProgress}% complete` : 'Processing...'}
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          disabled
                        >
                          Please wait...
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Backdrop>
          )}

          {/* Question Modal */}
          {isQuestionModalOpen && (
            <Backdrop>
              <div className="bg-card p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border border-border/50 transition-all duration-200 scale-100 dark:shadow-2xl dark:shadow-black/20">
                <h2 className="text-xl font-semibold mb-4">Ask a Question about {group.name}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Your Question</Label>
                    <Input
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask anything about the documents in this group..."
                      className="mt-1"
                    />
                  </div>
                  {answer && (
                    <div className="bg-accent p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Answer:</h3>
                      <p className="text-sm">{answer}</p>
                    </div>
                  )}
                  
                  {/* Source Documents */}
                  {searchDocuments && searchDocuments.length > 0 && (
                    <div className="bg-accent p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Source Documents:</h3>
                      <div className="space-y-2">
                        {searchDocuments.map((doc, index) => (
                          <div key={index} className="border-l-2 border-primary pl-3">
                            <h4 className="font-medium text-sm">{doc.title || 'Untitled Document'}</h4>
                            {doc.summary && (
                              <p className="text-xs text-muted-foreground mt-1">{doc.summary}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span>Page {searchSources[index]?.page_num || 'N/A'}</span>
                              <span>•</span>
                              <span>{doc.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsQuestionModalOpen(false);
                        setQuestion("");
                        setAnswer("");
                        setSearchSources([]);
                        setSearchDocuments([]);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleAskQuestion}
                      disabled={isAsking || !question.trim()}
                    >
                      {isAsking ? "Asking..." : "Ask Question"}
                    </Button>
                  </div>
                </div>
              </div>
            </Backdrop>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default GroupPage;

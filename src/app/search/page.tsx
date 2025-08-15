"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AppLayout from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const SearchPage = () => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search");
      }

      const data = await response.json();
      setAnswer(data.answer || "No results found");
      setSources(data.sources || []);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Failed to search");
    } finally {
      setIsSearching(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
              Global Search
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search across all your documents and get intelligent answers from your knowledge base.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Ask a Question
              </CardTitle>
              <CardDescription>
                Enter your question and get answers based on all your uploaded documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search-query">Your Question</Label>
                <Input
                  id="search-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your documents..."
                  className="mt-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Answer */}
          {answer && (
            <Card className="max-w-4xl mx-auto mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm leading-relaxed">{answer}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source Documents */}
          {documents && documents.length > 0 && (
            <Card className="max-w-4xl mx-auto mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Source Documents
                </CardTitle>
                <CardDescription>
                  Documents that were used to generate this answer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{doc.title || 'Untitled Document'}</h3>
                          {doc.summary && (
                            <p className="text-sm text-muted-foreground mb-2">{doc.summary}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Status: {doc.status}</span>
                            {doc.uploaded_at && (
                              <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          Page {sources[index]?.page_num || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="max-w-2xl mx-auto mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Search across all documents in all your groups
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    For group-specific questions, visit the group page
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Search className="w-4 h-4 text-primary mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Ask specific questions for better results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default SearchPage;

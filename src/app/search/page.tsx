"use client";

import { useState } from "react";
import { searchDocuments } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

interface SearchResult {
  description: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await searchDocuments(query);

      if (response.status === 200) {
        setResults(
          Array.isArray(response?.data?.data?.answer)
            ? response.data?.data?.answer
            : []
        );
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container m-20">
        <form onSubmit={handleSearch} className="">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="mb-2"
            required
          />
          <Button
            type="submit"
            className="bg-blue-500 text-white"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <div className="container m-20">
        {loading ? (
          // Loading skeletons
          <Card className="">
            <CardContent>
              <div className="flex items-center space-x-4 ">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 w-1/2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          // Search results
          results.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <p>{result.description}</p>
              </CardContent>
            </Card>
          ))
        ) : query != "" ? (
          // No results message
          <h1>No results found.</h1>
        ) : <></> }
      </div>
    </ProtectedRoute>
  );
}

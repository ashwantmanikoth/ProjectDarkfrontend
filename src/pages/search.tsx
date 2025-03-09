import { useState } from "react";
import { useRouter } from "next/router";
import { searchDocuments } from "../utils/api";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import { Input } from "../components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchResult {
  description: string;
}

const SearchPage = () => {
  const [query, setQuery] = useState("");
  // Initialize results as an empty array.
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await searchDocuments(query);
      if (response.status === 200) {
        // Ensure that we set an array; default to empty if undefined.

        // Update the setResults call to check if the response.data?.data?.answer[0] is an array. If it is, set the results to the first element of the array; otherwise, set the results to an empty array.
        setResults(
          Array.isArray(response?.data?.answer) ? response.data?.answer : []
        );
      }else{
        setResults([])
      }
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Search Documents</h1>
          <form onSubmit={handleSearch} className="mb-4">
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
          {loading && <Skeleton className="h-10 w-full" />}
          {results.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {results.map((result, index) => (
                    <li key={index} className="border-b py-2">
                      <p>{result.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            !loading && <p className="text-white">No results found.</p>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SearchPage;

import { useState } from "react";
import { useRouter } from "next/router";
import { searchDocuments } from "../utils/api";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await searchDocuments(query);
      console.log(response);
      setResults(response.data.answer);
      console.log(results);
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
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query"
              className="border p-2 w-full"
              required
            />
            <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
              Search
            </button>
          </form>
          {loading && <p>Loading...</p>}
          {results && (
            <div>
              <h2 className="text-xl font-semibold">Results:</h2>
              {/* <ul>
                            {results.map((result, index) => (
                                <li key={index} className="border-b py-2">
                                    <h3 className="font-bold">{}</h3>
                                    <p>{result}</p>
                                </li>
                            ))}
                        </ul> */}
              {results}
            </div>
          )}
          {results.length === 0 && !loading && <p>No results found.</p>}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SearchPage;

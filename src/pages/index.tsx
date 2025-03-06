import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

const Home: NextPage = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-sky-100">
          <h1 className="text-4xl font-bold mb-4 text-center">
           Search anything from you thousands of documents, within fraction of seconds.
          </h1>
          {/* <p className="text-lg mb-8">
            Upload and search your documents easily.
          </p> */}
          <div className="flex space-x-4">
            <Link href="/upload"legacyBehavior >
              <a className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Upload PDF
              </a>
            </Link>
            <Link href="/search" legacyBehavior>
              <a className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Search Documents
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Home;

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import { Skeleton } from "@/components/ui/skeleton"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    subscriptionType: "",
    // phoneNumber: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch(`/api/user`, { credentials: "include" });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUserData({
            username: data.name,
            email: data.email,
            subscriptionType: data.membership || "Free",
            // phoneNumber: data.phoneNumber || "Not Provided",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [status]);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-blue-400 p-6">
          <Card className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black text-center">User Information</CardTitle>
              <CardDescription className="text-center text-black">Your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 font-semibold">Username:</p>
                  <p className="text-gray-900">{userData.username}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Email:</p>
                  <p className="text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold">Subscription Type:</p>
                  <p className="text-gray-900">{userData.subscriptionType}</p>
                </div>
                <div>
                  {/* <p className="text-gray-700 font-semibold">Phone Number:</p>
                  <p className="text-gray-900">{userData.phoneNumber}</p> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default ProfilePage;

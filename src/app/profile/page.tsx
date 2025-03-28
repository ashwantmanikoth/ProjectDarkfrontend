"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    subscriptionType: "",
    image: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true);
          const response = await fetch(`/api/user`, { credentials: "include" });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await response.json();
          setUserData({
            username: data.name,
            email: data.email,
            subscriptionType: data.membership || "Free",
            image: data.image,
            createdAt: data.createdAt
          });
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [status]);

  return (
    <ProtectedRoute>
      <AppLayout children={undefined}/>
        <div className ="items-center justify-center p-10">
          {loading ? (
             Array.from({ length: 3 }).map((_, index) => (
                          <Card className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg mb-6" key={index}>
                            <CardContent className="p-4">
                              <Skeleton className="h-4 w-full mb-2" />
                              <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                          </Card>
                        ))
          ) : (
            <div className="inline-block">
              <Card className="max-w-md bg-white p-6 rounded-lg shadow-xl mb-6 ">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black text-center">
                    Profile
                  </CardTitle>
                
                </CardHeader>
                <CardContent>
                  <div className="inline-block">
                    <img
                      src={userData.image}
                      alt="profile picture"
                      className="w-24 h-24 rounded-lg"
                    />
                  </div>
                  <div className="ml-5 space-y-4 inline-block">
                    <div>
                      <p className="text-gray-700 font-semibold">Username:</p>
                      <p className="text-gray-900">{userData.username}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold">Email:</p>
                      <p className="text-gray-900">{userData.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg inline-flex">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black text-center">
                    Membership Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-700 font-semibold">
                        Membership Type:
                      </p>
                      <p className="text-gray-900">
                        {userData.subscriptionType}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold">
                        Join Date
                      </p>
                      <p className="text-gray-900">
                        {new Date(userData.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          )}
        </div>
      
    </ProtectedRoute>
  );
};

export default ProfilePage;

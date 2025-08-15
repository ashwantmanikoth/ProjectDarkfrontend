"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Group, Plus, FolderOpen, Upload, Search, MessageSquare, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { Group as GroupType } from "@/types";

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn();
    }
  }, [status]);

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }
      const data = await response.json();
      console.log("fetchGroups - Received groups:", data);
      data.forEach((group: any) => {
        console.log("fetchGroups - Group:", group.id, group.name, "type:", typeof group.id);
      });
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchGroups();
    }
  }, [status]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const newGroup = await response.json();
      setGroups(prev => [newGroup, ...prev]);
      setNewGroupName("");
      setNewGroupDescription("");
      setIsCreateModalOpen(false);
      toast.success("Group created successfully");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group? This will also delete all documents in the group.")) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      setGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  const handleGroupClick = (groupId: string) => {
    console.log("handleGroupClick - groupId:", groupId);
    console.log("handleGroupClick - groupId type:", typeof groupId);
    console.log("handleGroupClick - groupId === 'undefined':", groupId === 'undefined');
    
    if (!groupId || groupId === "undefined") {
      console.error("handleGroupClick - Invalid groupId:", groupId);
      toast.error("Invalid group ID");
      return;
    }
    
    console.log("handleGroupClick - Navigating to:", `/groups/${groupId}`);
    router.push(`/groups/${groupId}`);
  };

  if (status === "loading" || isLoading) {
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
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-4">
              Organize Your Knowledge
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create topic-based groups to organize your documents and get intelligent answers from your specific knowledge base.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Group
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/upload")}
                className="px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>

          {/* Groups Grid */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleGroupClick(group.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {group.documentCount || 0} docs
                      </Badge>
                    </div>
                    {group.description && (
                      <CardDescription className="text-sm">
                        {group.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupClick(group.id);
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Search
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mb-6">
                <Group className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No Groups Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first group to start organizing your documents by topic.
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Group
              </Button>
            </div>
          )}

          {/* Create Group Modal */}
          {isCreateModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Work Documents, Research Papers"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="group-description">Description (Optional)</Label>
                    <Input
                      id="group-description"
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Brief description of this group"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setNewGroupName("");
                        setNewGroupDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup}>
                      Create Group
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default HomePage;
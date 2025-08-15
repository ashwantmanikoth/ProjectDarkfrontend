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
import { Group, Plus, FolderOpen, Upload, Search, MessageSquare, Clock, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Group as GroupType } from "@/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Backdrop } from "@/components/ui/backdrop";
import { validateGroupName, getGroupNameErrorMessage } from "@/utils/input-sanitizer";
import { useDebounce } from "@/hooks/use-debounce";

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    groupId: string | null;
    groupName: string;
  }>({
    isOpen: false,
    groupId: null,
    groupName: "",
  });

  // Validation and loading states
  const [groupNameError, setGroupNameError] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

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
    // Validate group name
    const validation = validateGroupName(newGroupName.trim());
    if (!validation.isValid) {
      setGroupNameError(getGroupNameErrorMessage(validation));
      return;
    }

    // Clear any previous errors
    setGroupNameError("");

    // Set loading state
    setIsCreating(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: validation.sanitizedValue,
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
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    // Set loading state for specific group
    setDeletingGroupId(groupId);
    setIsDeleting(true);

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
    } finally {
      setIsDeleting(false);
      setDeletingGroupId(null);
    }
  };

  const openDeleteConfirmation = (groupId: string, groupName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      groupId,
      groupName,
    });
  };

  // Debounced group creation to prevent multiple rapid submissions
  const [debouncedCreateGroup, isCreatePending] = useDebounce(handleCreateGroup, 500);

  // Real-time validation for group name
  const handleGroupNameChange = (value: string) => {
    setNewGroupName(value);
    
    // Clear error when user starts typing
    if (groupNameError) {
      setGroupNameError("");
    }

    // Validate in real-time (debounced)
    if (value.trim().length >= 3) {
      const validation = validateGroupName(value.trim());
      if (!validation.isValid) {
        setGroupNameError(getGroupNameErrorMessage(validation));
      }
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
                variant="default"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Group
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/upload")}
                className="px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
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
                            openDeleteConfirmation(group.id, group.name);
                          }}
                          disabled={isDeleting && deletingGroupId === group.id}
                          className="h-6 px-2 text-xs text-destructive hover:text-destructive min-w-[60px]"
                        >
                          {isDeleting && deletingGroupId === group.id ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3 mr-1" />
                          )}
                          {isDeleting && deletingGroupId === group.id ? 'Deleting...' : 'Delete'}
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

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            isOpen={deleteConfirmation.isOpen}
            onClose={() => setDeleteConfirmation({ isOpen: false, groupId: null, groupName: "" })}
            onConfirm={() => {
              if (deleteConfirmation.groupId) {
                handleDeleteGroup(deleteConfirmation.groupId);
                setDeleteConfirmation({ isOpen: false, groupId: null, groupName: "" });
              }
            }}
            title="Delete Group"
            description={`Are you sure you want to delete "${deleteConfirmation.groupName}"? This will also delete all documents in the group.`}
            confirmText={isDeleting ? "Deleting..." : "Delete Group"}
            cancelText="Cancel"
            variant="destructive"
            icon={<Trash2 className="w-6 h-6 text-destructive" />}
            disabled={isDeleting}
          />

          {/* Create Group Modal */}
          {isCreateModalOpen && (
            <Backdrop>
              <div className="bg-card p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-border/50 transition-all duration-200 scale-100 dark:shadow-2xl dark:shadow-black/20">
                <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroupName}
                      onChange={(e) => handleGroupNameChange(e.target.value)}
                      placeholder="e.g., Work Documents, Research Papers (min. 5 characters)"
                      className={`mt-1 ${groupNameError ? 'border-destructive' : ''}`}
                    />
                    {groupNameError && (
                      <p className="text-sm text-destructive mt-1">{groupNameError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 5 characters, letters, numbers, and spaces only
                    </p>
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
                    <Button 
                      onClick={debouncedCreateGroup}
                      disabled={isCreating || isCreatePending || !!groupNameError || newGroupName.trim().length < 5}
                      className="min-w-[120px]"
                    >
                      {isCreating || isCreatePending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Group'
                      )}
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

export default HomePage;
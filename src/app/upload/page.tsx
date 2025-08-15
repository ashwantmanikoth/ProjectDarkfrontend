"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UploadPage = () => {
  const router = useRouter();

  useEffect(() => {
    toast.info("Please create a group first to organize your documents");
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Please create a group to upload documents</p>
      </div>
    </div>
  );
};

export default UploadPage;


import AppLayout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Search from "../search/page";

export default function Playground() {
  return (
    <ProtectedRoute>
        <AppLayout children={undefined} />
        <Search />
    </ProtectedRoute>
  );
}

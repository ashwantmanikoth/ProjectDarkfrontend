import { ReactNode, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { ThemeProvider } from "../components/theme-provider";
import { useRouter } from "next/router";
import NotificationDropdown from "./ui/NotificationDropdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CardProps = React.ComponentProps<typeof Card>;

const Layout = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newNotifications, setNewNotifications] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleLogout = async () => {
    await signOut();
  };

  const onProfileClick = () => {
    router.push("/profile");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <header className="flex justify-between items-center p-5 bg-gray-600 text-white">
          <Link href="/" legacyBehavior>
            <a className="text-xl font-bold">IntelliSearch</a>
          </Link>
          <div className="flex space-x-4">
            <NotificationDropdown hasNewNotifications={newNotifications} />
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center focus:outline-none"
              >
                <Image
                  src={session?.user?.image || "/default-profile.png"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={onProfileClick}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>{children}</main>
      </ThemeProvider>
    </div>
  );
};

export default Layout;
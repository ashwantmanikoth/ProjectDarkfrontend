"use client"

import Link from "next/link";
import NotificationDropdown from "./ui/NotificationDropdown";
import { useSession, signOut } from "next-auth/react";
// Use next/navigation instead of next/router
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";

const Navbar = () => {
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
    <header className="flex justify-between items-center p-3 bg-background text-foreground border-b">
      <Link
        href="/"
        className="text-3xl font-bold inline-block transition-all duration-1000 ease-in-out transform hover:tracking-wider hover:scale-105"
      >
        IntelliSearch
      </Link>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <NotificationDropdown hasNewNotifications={newNotifications} />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center focus:outline-none"
          >
            <Image
              src={session?.user?.image || "/default-profile.png"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-border"
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-2 ring-1 ring-border">
              <button
                onClick={onProfileClick}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

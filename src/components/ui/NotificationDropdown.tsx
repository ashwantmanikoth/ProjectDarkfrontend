import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { BellRing, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
];

const NotificationDropdown = ({ hasNewNotifications }: { hasNewNotifications: boolean }) => {
  console.log(hasNewNotifications)
  const [isNotification, setIsNotification] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleNotification = () => setIsNotification((prev) => !prev);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={notificationRef}>
      <button
        onClick={toggleNotification}
        className="flex items-center focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          id="Alarm-Bell-Ring--Streamline-Ultimate"
          height="30"
          width="24"
        >
          
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 18h15"
            stroke-width="1.5"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 18S18 16.694 18 12c0 -3.74999 -2.562 -7.06799 -6 -7.06799S6 8.25001 6 12c0 4.719 -1.5 6 -1.5 6"
            stroke-width="1.5"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 21c0 0.3978 -0.158 0.7794 -0.4393 1.0607S12.3978 22.5 12 22.5c-0.3978 0 -0.7794 -0.158 -1.0607 -0.4393S10.5 21.3978 10.5 21"
            stroke-width="1.5"
          ></path>
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.932V3"
            stroke-width="1.5"
          ></path>
          {hasNewNotifications && (
            <>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.81399 4.26599c-1.03818 0.57651 -1.89391 1.43258 -2.47 2.471"
                stroke-width="1.5"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.975 1.5c-1.0655 0.30294 -2.03591 0.87316 -2.8191 1.65653C2.3727 3.9399 1.8027 4.91043 1.5 5.976"
                stroke-width="1.5"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.186 4.26599c0.5157 0.28793 0.9894 0.64526 1.408 1.062 0.4174 0.41831 0.7748 0.89249 1.062 1.409"
                stroke-width="1.5"
              ></path>
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.025 1.5c1.0655 0.30294 2.0359 0.87316 2.8191 1.65653 0.7832 0.78337 1.3532 1.7539 1.6559 2.81947"
                stroke-width="1.5"
              ></path>
            </>
          )}
          
        </svg>{" "}
      </button>

      {isNotification && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-md shadow-lg py-2 ">
          <Card className={cn("w-[500]")}>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have 3 unread messages.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className=" flex items-center space-x-4 rounded-md border p-4">
                <BellRing />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Push Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to device.
                  </p>
                </div>
                <Switch />
              </div>
              <div>
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Check /> Mark all as read
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

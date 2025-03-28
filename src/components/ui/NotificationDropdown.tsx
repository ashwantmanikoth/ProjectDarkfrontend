import { useState, useRef, useEffect } from "react";
import { Bell, Icon } from "lucide-react"
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
    <div className="relative inline-block mt-2 z-10" ref={notificationRef}>
      <button
        onClick={toggleNotification}
        className="flex items-center focus:outline-none"
      >
        {hasNewNotifications ? <BellRing className="text-black" /> : <Bell className="text-black" />}
      </button>

      {isNotification && (
        <div className="absolute right-0 mt-2 w-80 text-black">
          <Card className={cn("w-[500] bg-white h-100 overflow-scroll")}>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className=" flex items-center space-x-4 ">
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

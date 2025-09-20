"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";

type ApiNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read?: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications");
        const data: ApiNotification[] = await res.json();
        setItems(data);
      } catch (_) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const mapped = useMemo(() => {
    return items.map((n) => ({
      ...n,
      time: "just now",
      actionUrl: undefined as string | undefined,
      icon:
        n.type === "grant" || n.type === "approval"
          ? CheckCircle
          : n.type === "verification"
          ? Clock
          : n.type === "wishlist"
          ? Bell
          : AlertCircle,
      iconColor:
        n.type === "grant" || n.type === "approval"
          ? "text-green-500"
          : n.type === "verification"
          ? "text-yellow-500"
          : n.type === "wishlist"
          ? "text-blue-500"
          : "text-orange-500",
    }));
  }, [items]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            Stay updated on your medication requests and community activity
          </p>
        </div>

        <div className="space-y-4">
          {mapped.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.read && "bg-blue-50 border-blue-200"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={cn(
                        "p-2 rounded-full bg-gray-100",
                        notification.iconColor
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <Badge variant="secondary">New</Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">
                        {notification.message}
                      </p>

                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <Button size="sm">Take Action</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!loading && mapped.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                You're all caught up! Check back later for updates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

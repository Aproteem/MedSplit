"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useCurrentUser } from "@/hooks/use-current-user";

type Wishlist = {
  id: number;
  user_id: number;
  medicine_id: number;
  quantity: number;
  approved?: boolean;
};
type Medicine = { id: number; name: string };

export default function DoctorToolsPage() {
  const { user } = useCurrentUser();
  const [pending, setPending] = useState<Wishlist[]>([]);
  const [meds, setMeds] = useState<Map<number, Medicine>>(new Map());
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [wRes, mRes] = await Promise.all([
        fetch("/api/wishlists"),
        fetch("/api/medicines"),
      ]);
      const wishes: Wishlist[] = await wRes.json();
      const allMeds: Medicine[] = await mRes.json();
      setMeds(new Map(allMeds.map((m) => [m.id, m])));
      setPending(wishes.filter((w) => !w.approved));
    } catch (_) {
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const approve = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/wishlists/${id}/approve`, { method: "POST" });
      await load();
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "doctor") {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Tools</h1>
            <p className="text-gray-600">
              Access restricted to verified doctors (demo)
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Tools</h1>
          <p className="text-gray-600">
            Approve patient medicine requests (demo)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              Approve to unlock checkout for patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {meds.get(w.medicine_id)?.name ||
                        `Medicine #${w.medicine_id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      Patient #{w.user_id} • Qty {w.quantity}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => approve(w.id)}
                    disabled={loading}
                  >
                    Approve
                  </Button>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="text-sm text-gray-500">No pending requests</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

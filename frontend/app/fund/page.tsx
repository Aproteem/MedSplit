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
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard-layout";

type Tx = {
  id: number;
  user_id?: number;
  type: "contribution" | "disbursement";
  amount: number;
  note?: string;
  created_at?: string;
};
type Summary = {
  balance: number;
  total_contributions: number;
  total_disbursements: number;
  recent: Tx[];
};

export default function FundPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/fund/summary");
      const data: Summary = await res.json();
      setSummary(data);
    } catch (_) {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const contribute = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    setLoading(true);
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          type: "contribution",
          amount: value,
          note,
        }),
      });
      setAmount("");
      setNote("");
      await load();
    } catch (_) {
      // ignore for demo
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Fund</h1>
          <p className="text-gray-600">
            Transparent ledger of community contributions and disbursements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
              <CardDescription>Total available for assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${summary ? summary.balance : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions</CardTitle>
              <CardDescription>Total received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ${summary ? summary.total_contributions : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disbursed</CardTitle>
              <CardDescription>Given to patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                ${summary ? summary.total_disbursements : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contribute</CardTitle>
            <CardDescription>Add funds to support micro-grants</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                type="number"
                placeholder="Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button onClick={contribute} disabled={loading}>
                Contribute
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Last 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(summary?.recent || []).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium">
                      {tx.type === "contribution"
                        ? "Contribution"
                        : "Disbursement"}
                    </div>
                    <div className="text-xs text-gray-500">{tx.note || ""}</div>
                  </div>
                  <div
                    className={
                      tx.type === "contribution"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {tx.type === "contribution" ? "+" : "-"}${tx.amount}
                  </div>
                </div>
              ))}
              {summary && summary.recent.length === 0 && (
                <div className="text-sm text-gray-500">No activity yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

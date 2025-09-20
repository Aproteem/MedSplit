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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Heart, Users, MapPin, Clock, CheckCircle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";

const recentSearches = [
  { name: "Metformin", lastSearched: "2 days ago", status: "approved" },
  { name: "Lisinopril", lastSearched: "1 week ago", status: "pending" },
  { name: "Atorvastatin", lastSearched: "2 weeks ago", status: "wishlisted" },
];

type Medicine = {
  id: number;
  name: string;
  generic_name?: string;
  description?: string;
  current_demand?: number;
  required_demand?: number;
};

type UiMedicine = {
  id: number;
  name: string;
  genericName: string;
  currentPrice: number;
  bulkPrice: number;
  currentDemand: number;
  requiredDemand: number;
  location: string;
  estimatedTime: string;
  description: string;
};

export default function BuyMedsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [results, setResults] = useState<UiMedicine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // initial load
    void fetchMedicines("");
  }, []);

  const mapToUi = (m: Medicine, index: number): UiMedicine => {
    const currentDemand = Number(m.current_demand || 0);
    const requiredDemand = Number(m.required_demand || 20);
    // simple derived pricing for demo
    const currentPrice = 25 + (index % 5) * 5 + 10;
    const bulkPrice = Math.max(5, currentPrice - 12);
    return {
      id: m.id,
      name: m.name,
      genericName: m.generic_name || "",
      description: m.description || "",
      currentDemand,
      requiredDemand,
      currentPrice,
      bulkPrice,
      location: "Within 5 miles",
      estimatedTime: "3-5 days",
    };
  };

  const fetchMedicines = async (query: string) => {
    setLoading(true);
    try {
      const url = query
        ? `/api/medicines?query=${encodeURIComponent(query)}`
        : "/api/medicines";
      const res = await fetch(url);
      const data: Medicine[] = await res.json();
      setResults(data.map((m, i) => mapToUi(m, i)));
      setSearchActive(true);
    } catch (_) {
      // noop for demo
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    void fetchMedicines(searchQuery);
  };

  const toggleWishlist = async (medId: number) => {
    const isAdding = !wishlistItems.includes(medId);
    setWishlistItems((prev) =>
      isAdding ? [...prev, medId] : prev.filter((id) => id !== medId)
    );
    if (isAdding) {
      try {
        await fetch("/api/wishlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1, medicine_id: medId, quantity: 1 }),
        });
        // Optimistically increment demand locally
        setResults((prev) =>
          prev.map((m) =>
            m.id === medId ? { ...m, currentDemand: m.currentDemand + 1 } : m
          )
        );
        alert("Added to wishlist and notified your doctor for verification");
      } catch (_) {
        // rollback on error
        setWishlistItems((prev) => prev.filter((id) => id !== medId));
      }
    }
  };

  const getDemandProgress = (current: number, required: number) => {
    return (current / required) * 100;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buy Medicines</h1>
          <p className="text-gray-600">
            Search for medications and join community bulk orders
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for medicines (e.g., Metformin, Lisinopril)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button onClick={handleSearch} size="lg" disabled={loading}>
                <Search className="h-5 w-5 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        {!searchActive && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>
                Quick access to your previously searched medications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-40 h-40 p-4 border rounded-2xl flex flex-col justify-between items-center hover:bg-gray-50"
                  >
                    <div className="text-center">
                      <p className="font-medium truncate">{search.name}</p>
                      <p className="text-sm text-gray-500">
                        {search.lastSearched}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2 items-center">
                      <Badge
                        variant={
                          search.status === "approved"
                            ? "default"
                            : search.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {search.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSearchQuery(search.name);
                          setSearchActive(true);
                        }}
                      >
                        Search Again
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {searchActive && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <p className="text-gray-600">{results.length} medicines found</p>
            </div>

            {results.map((med) => {
              const demandProgress = getDemandProgress(
                med.currentDemand,
                med.requiredDemand
              );
              const isInWishlist = wishlistItems.includes(med.id);

              return (
                <Card key={med.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Medicine Info */}
                      <div className="lg:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {med.name}
                          </h3>
                          <p className="text-gray-600">{med.genericName}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {med.description}
                          </p>
                        </div>

                        {/* Location and Time */}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{med.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Est. {med.estimatedTime}</span>
                          </div>
                        </div>

                        {/* Demand Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>Community Demand</span>
                            </span>
                            <span className="font-medium">
                              {med.currentDemand}/{med.requiredDemand} people
                            </span>
                          </div>
                          <Progress value={demandProgress} className="h-2" />
                          <p className="text-xs text-gray-500">
                            {med.requiredDemand - med.currentDemand} more people
                            needed for bulk order
                          </p>
                        </div>
                      </div>

                      {/* Pricing and Actions */}
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Current Price:
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                ${med.currentPrice}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Bulk Price:
                              </span>
                              <span className="text-lg font-semibold text-green-600">
                                ${med.bulkPrice}
                              </span>
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  You Save:
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  ${med.currentPrice - med.bulkPrice}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            onClick={() => toggleWishlist(med.id)}
                            variant={isInWishlist ? "default" : "outline"}
                            className="w-full"
                          >
                            {isInWishlist ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                In Wishlist
                              </>
                            ) : (
                              <>
                                <Heart className="h-4 w-4 mr-2" />
                                Add to Wishlist
                              </>
                            )}
                          </Button>

                          {isInWishlist && (
                            <p className="text-xs text-center text-gray-500">
                              Waiting for doctor approval
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {searchActive && results.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No medicines found
              </h3>
              <p className="text-gray-600 mb-4">
                Try searching with a different medicine name or check the
                spelling.
              </p>
              <Button variant="outline" onClick={() => setSearchActive(false)}>
                View Recent Searches
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

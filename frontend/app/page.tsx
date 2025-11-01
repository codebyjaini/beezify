"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Search,
  TrendingUp,
  Package,
  DollarSign,
  Filter,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// TypeScript interface for collectibles
interface Collectible {
  id: number;
  beezie_token_id: number;
  name: string | null;
  image_url: string | null;
  beezie_price: number | null;
  serial_number: string | null;
  year: string | null;
  grader: string | null;
  grade: string | null;
  player_name: string | null;
  set_name: string | null;
  card_number: string | null;
  category: string | null;
  language: string | null;
  alt_asset_id: string | null;
  alt_market_value: number | null;
  created_at: string;
  last_updated: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function Home() {
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [filteredCollectibles, setFilteredCollectibles] = useState<
    Collectible[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [graderFilter, setGraderFilter] = useState("all");
  const [sortBy, setSortBy] = useState("last_updated");

  // Fetch collectibles from backend API
  useEffect(() => {
    fetchCollectibles();
  }, []);

  // Filter and sort collectibles
  useEffect(() => {
    let filtered = [...collectibles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.set_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Grader filter
    if (graderFilter !== "all") {
      filtered = filtered.filter((item) => item.grader === graderFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price_high":
          return (b.beezie_price || 0) - (a.beezie_price || 0);
        case "price_low":
          return (a.beezie_price || 0) - (b.beezie_price || 0);
        case "alt_value_high":
          return (b.alt_market_value || 0) - (a.alt_market_value || 0);
        case "alt_value_low":
          return (a.alt_market_value || 0) - (b.alt_market_value || 0);
        case "last_updated":
        default:
          return (
            new Date(b.last_updated).getTime() -
            new Date(a.last_updated).getTime()
          );
      }
    });

    setFilteredCollectibles(filtered);
  }, [searchTerm, categoryFilter, graderFilter, sortBy, collectibles]);

  const fetchCollectibles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/collectibles?limit=1000`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCollectibles(result.data || []);
        setFilteredCollectibles(result.data || []);
      } else {
        console.error("API returned error:", result.error);
      }
    } catch (error) {
      console.error("Error fetching collectibles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters
  const categories = Array.from(
    new Set(collectibles.map((c) => c.category).filter(Boolean))
  );
  const graders = Array.from(
    new Set(collectibles.map((c) => c.grader).filter(Boolean))
  );

  // Generate Beezie marketplace URL
  const getBeezieUrl = (item: Collectible) => {
    if (!item.name) return null;
    // Remove # and replace spaces with hyphens
    const cleanName = item.name.replace(/#/g, "").replace(/\s+/g, "-");
    return `https://beezie.io/marketplace/collectible/${cleanName}-${item.beezie_token_id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🐝</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Beezify
                </h1>
                <p className="text-sm text-gray-600">
                  Collectible Market Value Tracker
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                {collectibles.length} Items
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchCollectibles}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">
                  {collectibles.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Filters */}
        <Card className="mb-6 shadow-md">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-600" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, player, set..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat!}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={graderFilter} onValueChange={setGraderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Grader" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Graders</SelectItem>
                  {graders.map((grader) => (
                    <SelectItem key={grader} value={grader!}>
                      {grader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_updated">Recently Updated</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="alt_value_high">
                    ALT Value: High to Low
                  </SelectItem>
                  <SelectItem value="alt_value_low">
                    ALT Value: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm ||
              categoryFilter !== "all" ||
              graderFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {filteredCollectibles.length} of {collectibles.length}{" "}
                  items
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setGraderFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Collectibles Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">🐝</div>
              <p className="text-gray-600">Loading collectibles...</p>
            </div>
          </div>
        ) : filteredCollectibles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-gray-600">
                No collectibles found matching your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollectibles.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
              >
                {/* Image */}
                {item.image_url && (
                  <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={item.image_url}
                      alt={item.name || "Collectible"}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {item.category && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          {item.category}
                        </Badge>
                      )}
                      {item.alt_market_value !== null && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 border-green-300"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ALT
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3 bg-gradient-to-br from-white to-yellow-50">
                  <CardTitle className="text-base line-clamp-2 text-gray-800">
                    {item.name || "Unknown Item"}
                  </CardTitle>
                  {item.player_name && (
                    <CardDescription className="font-medium text-orange-600">
                      {item.player_name}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {item.set_name && (
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-500 text-xs">Set:</span>
                        <span className="font-medium text-right text-xs">
                          {item.set_name}
                        </span>
                      </div>
                    )}
                    {item.year && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Year:</span>
                        <span className="font-medium text-xs">{item.year}</span>
                      </div>
                    )}
                    {item.grader && item.grade && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Grade:</span>
                        <Badge variant="outline" className="text-xs">
                          {item.grader} {item.grade}
                        </Badge>
                      </div>
                    )}
                    {item.serial_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Serial:</span>
                        <span className="font-mono font-medium text-xs">
                          #{item.serial_number}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Prices */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-green-700">
                          Beezie Price
                        </span>
                        {item.beezie_price ? (
                          <span className="font-bold text-green-600 text-lg">
                            ${item.beezie_price.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Not listed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-purple-700">
                          ALT Value
                        </span>
                        {item.alt_market_value ? (
                          <span className="font-bold text-purple-600 text-lg">
                            ${item.alt_market_value.toLocaleString()}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                              Not Available
                            </span>
                          </div>
                        )}
                      </div>
                      {item.alt_market_value && item.beezie_price && (
                        <div className="mt-1 text-xs text-gray-500">
                          {(
                            (item.alt_market_value / item.beezie_price - 1) *
                            100
                          ).toFixed(1)}
                          % vs Beezie
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex gap-2">
                    {item.name && getBeezieUrl(item) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-yellow-300 hover:bg-yellow-50 hover:border-yellow-400"
                        asChild
                      >
                        <a
                          href={getBeezieUrl(item)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1"
                        >
                          <span className="text-xs font-medium">
                            View on Beezie
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {item.alt_asset_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                        asChild
                      >
                        <a
                          href={`https://app.alt.xyz/research/${item.alt_asset_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1"
                        >
                          <span className="text-xs font-medium">
                            View on ALT
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>🐝 Built for Flow Forte Hackathon - Beezie Bounty</p>
          <p className="mt-1">
            Data synced every 6 hours from Beezie & ALT.xyz
          </p>
        </div>
      </footer>
    </div>
  );
}

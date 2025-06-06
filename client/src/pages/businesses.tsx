import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, MapPin, Search, Filter, Star, Phone, Mail, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";
import { Link } from "wouter";
import type { User } from "@shared/schema";

const businessTypes = [
  { value: "construction", label: "Construction" },
  { value: "real_estate", label: "Real Estate" },
  { value: "restaurant", label: "Restaurant" },
  { value: "healthcare", label: "Healthcare" },
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "hospitality", label: "Hospitality" },
  { value: "retail", label: "Retail" },
  { value: "automotive", label: "Automotive" },
  { value: "energy", label: "Energy" },
  { value: "logistics", label: "Logistics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "investment", label: "Investment" },
  { value: "other", label: "Other" }
];

export default function Businesses() {
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: businessesData, isLoading } = useQuery({
    queryKey: ["/api/businesses", { search, businessType, location: locationFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (businessType && businessType !== "all") params.append("businessType", businessType);
      if (locationFilter) params.append("location", locationFilter);
      
      const response = await fetch(`/api/businesses?${params}`);
      if (!response.ok) throw new Error("Failed to fetch businesses");
      return response.json();
    }
  });

  const businesses = businessesData?.businesses || [];

  const clearFilters = () => {
    setSearch("");
    setBusinessType("all");
    setLocationFilter("");
  };

  const BusinessCard = ({ business }: { business: User }) => (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{business.companyName || `${business.firstName} ${business.lastName}`}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {business.firstName} {business.lastName}
              </p>
            </div>
          </div>
          {business.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {business.businessType && (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm capitalize">
              {businessTypes.find(type => type.value === business.businessType)?.label || business.businessType}
            </span>
          </div>
        )}
        
        {business.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{business.location}</span>
          </div>
        )}
        
        {business.phoneNumber && (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{business.phoneNumber}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{business.email}</span>
        </div>
        
        {business.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {business.bio}
          </p>
        )}
        
        {business.tags && business.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {business.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {business.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{business.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <Button className="w-full mt-4" asChild>
          <Link href={`/profile/business/${business.id}`}>
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Businesses</h1>
        <p className="text-gray-600 dark:text-gray-400">Connect with businesses looking for contractors and services</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search businesses, company names, or descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {/* Filters */}
          <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Business Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2"></div>
            
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(10)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                Found {businesses.length} business{businesses.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
              {businesses.map((business: User) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No businesses found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
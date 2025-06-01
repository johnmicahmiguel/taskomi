import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wrench, MapPin, Search, Filter, Star, Phone, Mail, Award, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@shared/schema";

const commonSkills = [
  "Plumbing", "Electrical Work", "Carpentry", "Framing", "Roofing", "HVAC",
  "Painting", "Landscaping", "Flooring", "Kitchen Remodeling", "Bathroom Remodeling",
  "Concrete Work", "Solar Installation", "Windows", "Doors", "General Contracting"
];

export default function Contractors() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: contractorsData, isLoading } = useQuery({
    queryKey: ["/api/contractors", { search, location, skills: selectedSkills }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      selectedSkills.forEach(skill => params.append("skills", skill));
      
      const response = await fetch(`/api/contractors?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contractors");
      return response.json();
    }
  });

  const contractors = contractorsData?.contractors || [];

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setSelectedSkills([]);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const ContractorCard = ({ contractor }: { contractor: User }) => (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Wrench className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {contractor.firstName} {contractor.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Contractor
              </p>
            </div>
          </div>
          {contractor.isVerified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Star className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {contractor.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{contractor.location}</span>
          </div>
        )}
        
        {contractor.phoneNumber && (
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{contractor.phoneNumber}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{contractor.email}</span>
        </div>
        
        {contractor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {contractor.bio}
          </p>
        )}
        
        {contractor.skills && contractor.skills.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {contractor.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {contractor.skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{contractor.skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {contractor.certifications && contractor.certifications.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Certifications</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {contractor.certifications.slice(0, 2).map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cert}
                </Badge>
              ))}
              {contractor.certifications.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{contractor.certifications.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {contractor.tags && contractor.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {contractor.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contractor.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{contractor.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        <Button className="w-full mt-4">
          View Profile
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Contractors
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover skilled contractors for your projects
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contractors by name or description..."
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
          <div className={`mt-4 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
            
            {/* Skills Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
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
        ) : contractors.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Found {contractors.length} contractor{contractors.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contractors.map((contractor: User) => (
                <ContractorCard key={contractor.id} contractor={contractor} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contractors found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
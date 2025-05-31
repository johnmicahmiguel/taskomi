import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, Wrench, ArrowLeft, X } from "lucide-react";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Extend the schema with additional validation
const signupSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
  skills: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const commonSkills = [
  "Web Development", "Mobile Development", "Graphic Design", "Digital Marketing",
  "Content Writing", "SEO", "Project Management", "Data Analysis",
  "Accounting", "Legal Services", "Consulting", "Photography",
  "Video Production", "Translation", "Customer Service", "Sales"
];

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userType, setUserType] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      userType: "",
      companyName: "",
      phoneNumber: "",
      location: "",
      bio: "",
      skills: [],
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const { confirmPassword, ...signupData } = data;
      return apiRequest("POST", "/api/signup", {
        ...signupData,
        skills: userType === "contractor" ? selectedSkills : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Account created successfully!",
        description: "Welcome to ConnectPro. You can now start exploring opportunities.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate({ ...data, userType });
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-8 text-slate-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-6">
            Join ConnectPro
          </h1>
          <p className="text-xl text-slate-600 mb-12">
            Choose how you'd like to get started
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
              onClick={() => setUserType("business")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Business Owner</CardTitle>
                <CardDescription>
                  Find skilled contractors for your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Post project requirements</li>
                  <li>• Browse contractor profiles</li>
                  <li>• Manage multiple projects</li>
                  <li>• Secure payment processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-accent/50"
              onClick={() => setUserType("contractor")}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Wrench className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Contractor</CardTitle>
                <CardDescription>
                  Showcase your skills and find work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Create detailed profile</li>
                  <li>• Browse available projects</li>
                  <li>• Build client relationships</li>
                  <li>• Showcase your portfolio</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setUserType("")}
          className="mb-6 text-slate-600 hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to User Type
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              userType === "business" ? "bg-primary/10" : "bg-accent/10"
            }`}>
              {userType === "business" ? (
                <Building className={`h-8 w-8 ${userType === "business" ? "text-primary" : "text-accent"}`} />
              ) : (
                <Wrench className={`h-8 w-8 ${userType === "business" ? "text-primary" : "text-accent"}`} />
              )}
            </div>
            <CardTitle className="text-2xl">
              Create Your {userType === "business" ? "Business" : "Contractor"} Account
            </CardTitle>
            <CardDescription>
              {userType === "business" 
                ? "Start finding the perfect contractors for your projects" 
                : "Begin showcasing your skills and finding great projects"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userType === "business" && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {userType === "contractor" && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Skills & Expertise</FormLabel>
                      <Select onValueChange={addSkill}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select your skills" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonSkills
                            .filter(skill => !selectedSkills.includes(skill))
                            .map(skill => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedSkills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedSkills.map(skill => (
                            <Badge 
                              key={skill} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-red-100"
                              onClick={() => removeSkill(skill)}
                            >
                              {skill}
                              <X className="ml-1 h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {userType === "business" ? "About Your Business" : "Professional Bio"}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            userType === "business" 
                              ? "Tell us about your business and the types of projects you typically work on..."
                              : "Describe your experience, expertise, and what makes you unique..."
                          }
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending}
                  size="lg"
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
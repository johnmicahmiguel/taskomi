import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone,
  MessageSquare,
  FileText,
  User,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";
import SEOHead from "@/components/SEOHead";
import { Link } from "wouter";

export default function JobOrderDetails() {
  const [match, params] = useRoute("/job-orders/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const jobOrderId = params?.id ? parseInt(params.id) : null;

  // Fetch job order details
  const { data: jobOrderData, isLoading } = useQuery({
    queryKey: [`/api/job-orders/${jobOrderId}`],
    queryFn: async () => {
      if (!jobOrderId) throw new Error("No job order ID");
      const response = await fetch(`/api/job-orders/${jobOrderId}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job order details");
      }
      return response.json();
    },
    enabled: !!jobOrderId
  });

  const jobOrder = jobOrderData?.jobOrder;

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const response = await fetch(`/api/job-applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to update application status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-orders/${jobOrderId}`] });
      toast({
        title: "Success",
        description: "Application status updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive"
      });
    }
  });

  // Update inquiry status mutation
  const updateInquiryStatusMutation = useMutation({
    mutationFn: async ({ inquiryId, status }: { inquiryId: number; status: string }) => {
      const response = await fetch(`/api/job-inquiries/${inquiryId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status }),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to update inquiry status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/job-orders/${jobOrderId}`] });
      toast({
        title: "Success",
        description: "Inquiry status updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inquiry status",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "answered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4" />;
      case "in_progress": return <Users className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "answered": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!match || !jobOrderId) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Job Order Not Found</h1>
            <p className="text-muted-foreground mt-2">The job order you're looking for doesn't exist.</p>
            <Link href="/job-orders">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Orders
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!jobOrder) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Job Order Not Found</h1>
            <p className="text-muted-foreground mt-2">The job order you're looking for doesn't exist.</p>
            <Link href="/job-orders">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Orders
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEOHead title={`${jobOrder.title} - Job Order Details`} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/job-orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{jobOrder.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                <Badge className={getStatusColor(jobOrder.status)}>
                  {getStatusIcon(jobOrder.status)}
                  <span className="ml-1 capitalize">{jobOrder.status.replace("_", " ")}</span>
                </Badge>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {format(new Date(jobOrder.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">{jobOrder.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {jobOrder.budgetRange && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>Budget: {jobOrder.budgetRange}</span>
                </div>
              )}
              
              {jobOrder.projectSize && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Size: {jobOrder.projectSize}</span>
                </div>
              )}
              
              {jobOrder.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{jobOrder.location}</span>
                </div>
              )}
              
              {jobOrder.deadline && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>Due: {format(new Date(jobOrder.deadline), "MMM dd, yyyy")}</span>
                </div>
              )}
            </div>
            
            {jobOrder.requiredSkills && jobOrder.requiredSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {jobOrder.requiredSkills.map((skill: string) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{jobOrder.applicationsCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{jobOrder.inquiriesCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Inquiries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{jobOrder.messagesCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Applications, Inquiries, and Messages */}
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">
              Applications ({jobOrder.applications?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="inquiries">
              Inquiries ({jobOrder.inquiries?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="messages">
              Messages ({jobOrder.messages?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            {!jobOrder.applications || jobOrder.applications.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No Applications Yet</h3>
                      <p className="text-muted-foreground">
                        No contractors have applied to this job order yet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobOrder.applications.map((application: any) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              <AvatarInitials name={`${application.contractor?.firstName} ${application.contractor?.lastName}`} />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">
                              {application.contractor?.firstName} {application.contractor?.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {application.contractor?.email}
                            </p>
                            {application.contractor?.location && (
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {application.contractor.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status}</span>
                          </Badge>
                          {application.status === "pending" && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApplicationStatusMutation.mutate({
                                  applicationId: application.id,
                                  status: "accepted"
                                })}
                                disabled={updateApplicationStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApplicationStatusMutation.mutate({
                                  applicationId: application.id,
                                  status: "rejected"
                                })}
                                disabled={updateApplicationStatusMutation.isPending}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {application.coverLetter && (
                        <div className="mb-4">
                          <h5 className="font-medium mb-2">Cover Letter:</h5>
                          <p className="text-sm text-muted-foreground">{application.coverLetter}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {application.proposedBudget && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>Proposed: {application.proposedBudget}</span>
                          </div>
                        )}
                        
                        {application.estimatedDuration && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>Duration: {application.estimatedDuration}</span>
                          </div>
                        )}
                      </div>
                      
                      {application.contractor?.skills && application.contractor.skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {application.contractor.skills.map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        Applied on {format(new Date(application.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inquiries" className="mt-6">
            {!jobOrder.inquiries || jobOrder.inquiries.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No Inquiries Yet</h3>
                      <p className="text-muted-foreground">
                        No contractors have made inquiries about this job order yet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobOrder.inquiries.map((inquiry: any) => (
                  <Card key={inquiry.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              <AvatarInitials name={`${inquiry.contractor?.firstName} ${inquiry.contractor?.lastName}`} />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">
                              {inquiry.contractor?.firstName} {inquiry.contractor?.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {inquiry.contractor?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(inquiry.status)}>
                            {getStatusIcon(inquiry.status)}
                            <span className="ml-1 capitalize">{inquiry.status}</span>
                          </Badge>
                          {inquiry.status === "open" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInquiryStatusMutation.mutate({
                                inquiryId: inquiry.id,
                                status: "answered"
                              })}
                              disabled={updateInquiryStatusMutation.isPending}
                            >
                              Mark Answered
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium">Subject:</h5>
                          <p className="text-sm">{inquiry.subject}</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Message:</h5>
                          <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        Sent on {format(new Date(inquiry.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            {!jobOrder.messages || jobOrder.messages.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">No Messages Yet</h3>
                      <p className="text-muted-foreground">
                        No messages have been exchanged for this job order yet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobOrder.messages.map((message: any) => (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            <AvatarInitials name={`${message.sender?.firstName} ${message.sender?.lastName}`} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-medium">
                              {message.sender?.firstName} {message.sender?.lastName}
                            </h5>
                            <Badge variant="outline" className="text-xs">
                              {message.sender?.userType}
                            </Badge>
                            {!message.isRead && (
                              <Badge variant="secondary" className="text-xs">
                                Unread
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{message.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
} 
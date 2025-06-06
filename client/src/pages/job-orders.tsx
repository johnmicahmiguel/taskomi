import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, MapPin, DollarSign, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { insertJobOrderSchema } from "@shared/schema";
import { z } from "zod";
import AppLayout from "@/components/AppLayout";

type JobOrderFormData = z.infer<typeof insertJobOrderSchema>;

export default function JobOrders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJobOrder, setEditingJobOrder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<Partial<JobOrderFormData>>({
    title: "",
    description: "",
    budgetRange: "",
    projectSize: "",
    deadline: undefined,
    location: "",
    requiredSkills: [],
    status: "open"
  });

  // Fetch job orders
  const { data: jobOrdersData, isLoading } = useQuery({
    queryKey: ["/api/job-orders"],
    queryFn: async () => {
      const response = await fetch("/api/job-orders", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch job orders");
      }
      return response.json();
    }
  });

  const jobOrders = jobOrdersData?.jobOrders || [];

  // Filter job orders by status
  const getFilteredJobOrders = () => {
    if (activeTab === "all") return jobOrders;
    if (activeTab === "active") return jobOrders.filter((jo: any) => jo.status === "open" || jo.status === "in_progress");
    if (activeTab === "pending") return jobOrders.filter((jo: any) => jo.status === "open");
    if (activeTab === "completed") return jobOrders.filter((jo: any) => jo.status === "completed");
    return jobOrders;
  };

  // Create job order mutation
  const createJobOrderMutation = useMutation({
    mutationFn: async (data: JobOrderFormData) => {
      console.log("Sending job order data:", data);
      const response = await fetch("/api/job-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      
      const result = await response.json();
      console.log("Job order response:", result);
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to create job order");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-orders"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Job order created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job order",
        variant: "destructive"
      });
    }
  });

  // Update job order mutation
  const updateJobOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<JobOrderFormData> }) => {
      const response = await fetch(`/api/job-orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to update job order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-orders"] });
      setEditingJobOrder(null);
      resetForm();
      toast({
        title: "Success",
        description: "Job order updated successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job order",
        variant: "destructive"
      });
    }
  });

  // Delete job order mutation
  const deleteJobOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/job-orders/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to delete job order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-orders"] });
      toast({
        title: "Success",
        description: "Job order deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job order",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      budgetRange: "",
      projectSize: "",
      deadline: undefined,
      location: "",
      requiredSkills: [],
      status: "open"
    });
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      title: formData.title,
      description: formData.description,
      budgetRange: formData.budgetRange || null,
      projectSize: formData.projectSize || null,
      deadline: formData.deadline || null,
      location: formData.location || null,
      requiredSkills: formData.requiredSkills && formData.requiredSkills.length > 0 ? formData.requiredSkills : null,
      status: formData.status || "open"
    };

    console.log("Submitting job order:", submitData);

    if (editingJobOrder) {
      updateJobOrderMutation.mutate({ id: editingJobOrder.id, data: submitData });
    } else {
      createJobOrderMutation.mutate(submitData);
    }
  };

  const handleEdit = (jobOrder: any) => {
    setEditingJobOrder(jobOrder);
    setFormData({
      title: jobOrder.title,
      description: jobOrder.description,
      budgetRange: jobOrder.budgetRange || "",
      projectSize: jobOrder.projectSize || "",
      deadline: jobOrder.deadline ? new Date(jobOrder.deadline) : undefined,
      location: jobOrder.location || "",
      requiredSkills: jobOrder.requiredSkills || [],
      status: jobOrder.status
    });
    setIsCreateDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4" />;
      case "in_progress": return <Users className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const filteredJobOrders = getFilteredJobOrders();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Job Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your job postings and track applications</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingJobOrder(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingJobOrder ? "Edit Job Order" : "Create New Job Order"}</DialogTitle>
                <DialogDescription>
                  {editingJobOrder ? "Update your job order details" : "Fill in the details for your new job posting"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Website Development"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the job requirements, expectations, and deliverables..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetRange">Budget Range (PHP)</Label>
                    <Input
                      id="budgetRange"
                      placeholder="e.g., ₱50,000 - ₱250,000"
                      value={formData.budgetRange || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectSize">Project Size</Label>
                    <Select value={formData.projectSize || undefined} onValueChange={(value) => setFormData(prev => ({ ...prev, projectSize: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (less than 1 month)</SelectItem>
                        <SelectItem value="medium">Medium (1-3 months)</SelectItem>
                        <SelectItem value="large">Large (3+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Remote, New York, NY"
                      value={formData.location || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      min={format(new Date(), "yyyy-MM-dd")}
                      max="2030-12-31"
                      value={formData.deadline ? format(formData.deadline, "yyyy-MM-dd") : ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        deadline: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requiredSkills">Required Skills</Label>
                  <Input
                    id="requiredSkills"
                    placeholder="e.g., Plumbing, Electrical Work, Carpentry (comma separated)"
                    value={formData.requiredSkills?.join(", ") || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      requiredSkills: e.target.value.split(",").map(skill => skill.trim()).filter(Boolean)
                    }))}
                  />
                </div>

                {editingJobOrder && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createJobOrderMutation.isPending || updateJobOrderMutation.isPending}
                  >
                    {createJobOrderMutation.isPending || updateJobOrderMutation.isPending 
                      ? "Saving..." 
                      : editingJobOrder ? "Update" : "Create"
                    }
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({jobOrders.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobOrders.filter((jo: any) => jo.status === "open" || jo.status === "in_progress").length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({jobOrders.filter((jo: any) => jo.status === "open").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({jobOrders.filter((jo: any) => jo.status === "completed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredJobOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Plus className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No job orders found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {activeTab === "all" 
                          ? "Create your first job order to get started" 
                          : `No ${activeTab} job orders at the moment`
                        }
                      </p>
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobOrders.map((jobOrder: any) => (
                  <Card key={jobOrder.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl">{jobOrder.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <Badge className={getStatusColor(jobOrder.status)}>
                              {getStatusIcon(jobOrder.status)}
                              <span className="ml-1 capitalize">{jobOrder.status.replace("_", " ")}</span>
                            </Badge>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(jobOrder.createdAt), "MMM dd, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(jobOrder)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{jobOrder.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteJobOrderMutation.mutate(jobOrder.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {jobOrder.description}
                      </p>
                      
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
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Skills:</p>
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
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
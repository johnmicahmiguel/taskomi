import { Building, Wrench, UserPlus, ListChecks, Search, MessageSquare, Handshake, IdCard, Briefcase, Bell, Mail, Star } from "lucide-react";

export default function Features() {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Built for Both Sides of Your Business
          </h2>
          <p className="text-xl text-slate-600">
            Powerful tools designed specifically for business owners and contractors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Business Owners Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">For Business Owners</h3>
              <p className="text-slate-600 mb-8">
                Find, hire, and collaborate with top contractors for your projects
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Create Business Profile</h4>
                  <p className="text-slate-600 text-sm">
                    Showcase your company and build trust with contractors
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ListChecks className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Post Job Orders</h4>
                  <p className="text-slate-600 text-sm">
                    Create detailed job postings and receive proposals
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Find Expert Contractors</h4>
                  <p className="text-slate-600 text-sm">
                    Browse verified contractors by skill and location
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Direct Communication</h4>
                  <p className="text-slate-600 text-sm">
                    Chat directly with contractors and build relationships
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Handshake className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Long-term Partnerships</h4>
                  <p className="text-slate-600 text-sm">
                    Build ongoing collaborations with trusted contractors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contractors Section */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-xl mb-4">
                <Wrench className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">For Contractors</h3>
              <p className="text-slate-600 mb-8">
                Showcase your skills and connect with businesses seeking your expertise
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <IdCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Professional Profile</h4>
                  <p className="text-slate-600 text-sm">
                    Create a compelling profile showcasing your skills and portfolio
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Browse Job Opportunities</h4>
                  <p className="text-slate-600 text-sm">
                    Access a curated list of jobs matching your expertise
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Real-time Notifications</h4>
                  <p className="text-slate-600 text-sm">
                    Get notified when you're selected for projects
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Connect with Businesses</h4>
                  <p className="text-slate-600 text-sm">
                    Reach out to businesses and showcase your value
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Build Your Reputation</h4>
                  <p className="text-slate-600 text-sm">
                    Receive ratings and build a strong professional reputation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

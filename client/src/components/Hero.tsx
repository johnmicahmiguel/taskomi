import { Button } from "@/components/ui/button";
import { Building, Wrench } from "lucide-react";

export default function Hero() {
  const handleSignup = (userType: string) => {
    alert(`Redirecting to ${userType} signup flow...`);
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Connect Businesses with{" "}
            <span className="text-primary">Expert Contractors</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            The marketplace that brings business owners and skilled contractors together. 
            Find your perfect match, collaborate on projects, or build long-term partnerships.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold shadow-lg"
              onClick={() => handleSignup("Business Owner")}
            >
              <Building className="mr-2 h-5 w-5" />
              I'm a Business Owner
            </Button>
            <Button 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 text-lg font-semibold shadow-lg"
              onClick={() => handleSignup("Contractor")}
            >
              <Wrench className="mr-2 h-5 w-5" />
              I'm a Contractor
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
            <div className="text-slate-600">Active Businesses</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-accent mb-2">25,000+</div>
            <div className="text-slate-600">Verified Contractors</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-3xl font-bold text-slate-800 mb-2">500,000+</div>
            <div className="text-slate-600">Projects Completed</div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How ConnectPro Works
          </h2>
          <p className="text-xl text-slate-600">Simple steps to find your perfect match</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Create Your Profile</h3>
            <p className="text-slate-600">
              Sign up and create a detailed profile showcasing your business needs or contractor skills.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Connect & Match</h3>
            <p className="text-slate-600">
              Our smart matching system connects businesses with the right contractors based on skills and needs.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Collaborate & Grow</h3>
            <p className="text-slate-600">
              Work together on projects, build long-term partnerships, and grow your business network.
            </p>
          </div>
        </div>

        {/* Special Collaboration Feature */}
        <div className="mt-20 bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              🤝 Special Feature: Long-term Collaborations
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Go beyond one-time projects. Build lasting partnerships with contractors who understand your business. 
              Create employee-like relationships for ongoing work and consistent quality.
            </p>
            <Button 
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-slate-100"
              onClick={() => alert("Learn more about collaborations...")}
            >
              Learn More About Collaborations
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

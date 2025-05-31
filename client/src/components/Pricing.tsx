import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "Up to 3 active job posts",
        "Basic contractor search",
        "Message with contractors",
        "Basic support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$49",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Unlimited job posts",
        "Advanced contractor filtering",
        "Priority support",
        "Long-term collaboration tools",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Custom integrations",
        "Dedicated account manager",
        "White-label options",
        "24/7 phone support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "Enterprise") {
      alert("Redirecting to contact sales form...");
    } else {
      alert(`Selected ${planName} plan. Redirecting to signup...`);
    }
  };

  return (
    <section className="py-20 bg-slate-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600">Choose the plan that works best for your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-8 ${
                plan.popular 
                  ? "border-2 border-primary relative" 
                  : "border border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-slate-900 mb-2">
                  {plan.price}
                  {plan.period && <span className="text-lg text-slate-600">{plan.period}</span>}
                </div>
                <p className="text-slate-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-slate-600">
                    <Check className="h-4 w-4 text-accent mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? "bg-primary hover:bg-primary/90 text-white" 
                    : plan.name === "Enterprise"
                    ? "bg-accent hover:bg-accent/90 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                }`}
                onClick={() => handlePlanSelect(plan.name)}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            For contractors, ConnectPro is always free to join. We only charge a small commission on completed projects.
          </p>
          <button className="text-primary hover:text-primary/80 font-medium">
            Learn more about contractor pricing →
          </button>
        </div>
      </div>
    </section>
  );
}

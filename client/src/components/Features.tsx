import { useState, useEffect, useRef } from "react";
import { Building, Wrench, UserPlus, ListChecks, Search, MessageSquare, Handshake, Users2, CheckCircle, Zap } from "lucide-react";

// Visual components for each step
const FeatureVisual = ({ step, isActive }: { step: number; isActive: boolean }) => {
  const baseClasses = "transition-all duration-500 ease-out";
  const activeClasses = isActive ? "opacity-100 scale-100" : "opacity-30 scale-95";

  const visuals = [
    // Step 1: Create Profile
    <div className={`${baseClasses} ${activeClasses} flex items-center justify-center h-64`}>
      <div className="relative">
        <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center">
          <Building className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <UserPlus className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>,
    
    // Step 2: Post Jobs
    <div className={`${baseClasses} ${activeClasses} flex items-center justify-center h-64`}>
      <div className="space-y-4">
        <div className="bg-slate-100 rounded-lg p-4 w-48">
          <div className="h-3 bg-primary/70 rounded mb-2"></div>
          <div className="h-2 bg-slate-300 rounded mb-1"></div>
          <div className="h-2 bg-slate-300 rounded w-3/4"></div>
        </div>
        <div className="bg-slate-100 rounded-lg p-4 w-48">
          <div className="h-3 bg-primary/50 rounded mb-2"></div>
          <div className="h-2 bg-slate-300 rounded mb-1"></div>
          <div className="h-2 bg-slate-300 rounded w-2/3"></div>
        </div>
        <ListChecks className="h-8 w-8 text-primary mx-auto" />
      </div>
    </div>,
    
    // Step 3: Find Contractors
    <div className={`${baseClasses} ${activeClasses} flex items-center justify-center h-64`}>
      <div className="relative">
        <Search className="h-12 w-12 text-primary mb-4 mx-auto" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gradient-to-br from-accent/20 to-accent/40 rounded-lg flex items-center justify-center">
              <Users2 className="h-6 w-6 text-accent" />
            </div>
          ))}
        </div>
      </div>
    </div>,
    
    // Step 4: Communication
    <div className={`${baseClasses} ${activeClasses} flex items-center justify-center h-64`}>
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="bg-primary text-white p-3 rounded-lg rounded-br-sm max-w-32">
            <div className="h-2 bg-white/80 rounded mb-1"></div>
            <div className="h-2 bg-white/60 rounded w-3/4"></div>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-slate-200 p-3 rounded-lg rounded-bl-sm max-w-32">
            <div className="h-2 bg-slate-400 rounded mb-1"></div>
            <div className="h-2 bg-slate-400 rounded w-2/3"></div>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-primary text-white p-3 rounded-lg rounded-br-sm max-w-28">
            <div className="h-2 bg-white/80 rounded"></div>
          </div>
        </div>
        <MessageSquare className="h-6 w-6 text-primary mx-auto" />
      </div>
    </div>,
    
    // Step 5: Partnerships
    <div className={`${baseClasses} ${activeClasses} flex items-center justify-center h-64`}>
      <div className="relative">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-primary" />
          </div>
          <Handshake className="h-8 w-8 text-accent" />
          <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full flex items-center justify-center">
            <Wrench className="h-8 w-8 text-accent" />
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <CheckCircle key={i} className="h-4 w-4 text-green-500" />
            ))}
          </div>
        </div>
      </div>
    </div>
  ];

  return visuals[step] || visuals[0];
};

export default function Features() {
  const [activeStep, setActiveStep] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isInSection, setIsInSection] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastWheelTime = useRef(0);
  const wheelAccumulator = useRef(0);
  const isAnimatingRef = useRef(false);

  const steps = [
    {
      icon: UserPlus,
      title: "Create Business Profile",
      description: "Showcase your company and build trust with contractors"
    },
    {
      icon: ListChecks,
      title: "Post Job Orders",
      description: "Create detailed job postings and receive proposals"
    },
    {
      icon: Search,
      title: "Find Expert Contractors",
      description: "Browse verified contractors by skill and location"
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Chat directly with contractors and build relationships"
    },
    {
      icon: Handshake,
      title: "Long-term Partnerships",
      description: "Build ongoing collaborations with trusted contractors"
    }
  ];

  const changeStep = (direction: number) => {
    if (isAnimatingRef.current) return;
    
    let newStep = activeStep;
    if (direction > 0 && activeStep < steps.length - 1) {
      newStep = activeStep + 1;
    } else if (direction < 0 && activeStep > 0) {
      newStep = activeStep - 1;
    }
    
    if (newStep !== activeStep) {
      isAnimatingRef.current = true;
      setActiveStep(newStep);
      
      // Shorter animation lock for smoother transitions
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 300);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionTop = sectionRef.current.offsetTop;
      const sectionHeight = sectionRef.current.offsetHeight;
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      // Define tighter bounds for the interactive section
      const sectionStart = sectionTop + (sectionHeight * 0.3);
      const sectionEnd = sectionTop + (sectionHeight * 0.7);
      
      const wasInSection = isInSection;
      const nowInSection = scrollPosition >= sectionStart && scrollPosition <= sectionEnd;
      
      if (nowInSection !== wasInSection) {
        setIsInSection(nowInSection);
        setIsLocked(nowInSection);
      }
      
      // Only update step when not locked by wheel/touch interactions
      if (nowInSection && !isLocked) {
        const progress = (scrollPosition - sectionStart) / (sectionEnd - sectionStart);
        const newStep = Math.min(Math.max(Math.floor(progress * steps.length), 0), steps.length - 1);
        
        if (newStep !== activeStep && !isAnimatingRef.current) {
          setActiveStep(newStep);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!isInSection || isAnimatingRef.current) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTime.current;
      
      // Reset accumulator if too much time has passed (debounce)
      if (timeSinceLastWheel > 200) {
        wheelAccumulator.current = 0;
      }
      
      // Accumulate wheel delta for more stable detection
      wheelAccumulator.current += e.deltaY;
      lastWheelTime.current = now;
      
      // Lower threshold and smoother detection
      const threshold = 50;
      if (Math.abs(wheelAccumulator.current) >= threshold) {
        const direction = wheelAccumulator.current > 0 ? 1 : -1;
        changeStep(direction);
        wheelAccumulator.current = 0; // Reset after triggering
        
        // Shorter lock to prevent rapid firing but allow smooth transitions
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 300);
      }
    };

    // Touch handling with improved gesture detection
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isInSection) return;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      touchMoved = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isInSection) return;
      touchMoved = true;
      
      // Prevent page scrolling during touch interaction in section
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isInSection || !touchMoved || isAnimatingRef.current) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const touchDelta = touchStartY - touchEndY;
      const timeDelta = Date.now() - touchStartTime;
      const velocity = Math.abs(touchDelta) / timeDelta;
      
      // Improved thresholds for smoother touch navigation
      if (Math.abs(touchDelta) > 25 && velocity > 0.2) {
        const direction = touchDelta > 0 ? 1 : -1;
        changeStep(direction);
        
        // Shorter lock consistent with wheel handling
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 300);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInSection || isAnimatingRef.current) return;
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        changeStep(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        changeStep(-1);
      }
    };

    // Use passive for scroll, but non-passive for wheel to allow preventDefault
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeStep, isInSection, isLocked, steps.length]);

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Built for Both Sides of Your Business
          </h2>
          <p className="text-xl text-slate-600">
            Powerful tools designed specifically for business owners and contractors
          </p>
        </div>

        {/* Interactive Steps Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Steps - Left Side */}
          <div className="space-y-8">
            <div className="text-center lg:text-left mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4">
                <Building className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">For Business Owners</h3>
              <p className="text-slate-600">
                Find, hire, and collaborate with top contractors for your projects
              </p>
              
              {/* Step Progress Indicator */}
              <div className="flex items-center justify-center lg:justify-start mt-6 space-x-2">
                <span className="text-sm text-slate-500">Scroll to explore:</span>
                <div className="flex space-x-1 ml-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === activeStep 
                          ? 'bg-primary w-6' 
                          : index < activeStep 
                          ? 'bg-primary/60' 
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  {activeStep + 1}/{steps.length}
                </span>
              </div>
            </div>

            <div className="space-y-8 relative">
              {/* Progress Line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200">
                <div 
                  className="w-full bg-primary transition-all duration-300 ease-out"
                  style={{
                    height: `${((activeStep + 1) / steps.length) * 100}%`
                  }}
                />
              </div>

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div
                    key={index}
                    ref={(el) => (stepRefs.current[index] = el)}
                    className={`flex items-start space-x-4 transition-all duration-300 ease-out relative z-10 ${
                      isActive 
                        ? 'transform scale-105 bg-primary/5 -mx-4 px-4 py-4 rounded-xl shadow-sm' 
                        : isCompleted
                        ? 'opacity-80'
                        : 'opacity-60'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary shadow-lg shadow-primary/25 scale-110 ring-4 ring-primary/20' 
                        : isCompleted
                        ? 'bg-primary/80'
                        : 'bg-primary/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 transition-all duration-500 ${
                        isActive ? 'text-slate-900 text-lg' : 'text-slate-800'
                      }`}>
                        <span className="text-xs text-primary font-medium mr-2">
                          STEP {index + 1}
                        </span>
                        <br />
                        {step.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-500 ${
                        isActive ? 'text-slate-700' : 'text-slate-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0 animate-bounce">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual - Right Side */}
          <div className="flex flex-col items-center justify-center lg:sticky lg:top-24 lg:h-96">
            <div className="w-full max-w-sm">
              <FeatureVisual step={activeStep} isActive={true} />
            </div>
            
            {/* Scroll Hint */}
            <div className="mt-8 text-center">
              <p className={`text-sm mb-2 transition-colors duration-300 ${
                isInSection 
                  ? isLocked 
                    ? 'text-orange-500' 
                    : 'text-primary'
                  : 'text-slate-500'
              }`}>
                {isInSection 
                  ? isLocked 
                    ? 'Step transitioning...'
                    : 'Use scroll wheel or swipe to navigate'
                  : 'Scroll here to explore features'
                }
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-4 h-6 border-2 rounded-full flex justify-center transition-all duration-300 ${
                  isInSection 
                    ? isLocked
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-primary bg-primary/5'
                    : 'border-slate-300'
                }`}>
                  <div className={`w-1 h-2 rounded-full mt-1 transition-all duration-300 ${
                    isInSection 
                      ? isLocked
                        ? 'bg-orange-400 animate-pulse'
                        : 'bg-primary animate-bounce'
                      : 'bg-slate-400 animate-bounce'
                  }`} />
                </div>
                <span className={`text-xs transition-colors duration-300 ${
                  isInSection 
                    ? isLocked 
                      ? 'text-orange-400'
                      : 'text-primary'
                    : 'text-slate-400'
                }`}>
                  {isInSection 
                    ? isLocked 
                      ? 'Locked'
                      : 'Interactive'
                    : 'Scroll'
                  }
                </span>
              </div>
              
              {/* Keyboard hint */}
              {isInSection && (
                <div className="mt-3 text-xs text-slate-400">
                  Or use arrow keys ↑↓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contractors Section - Static */}
        <div className="border-t border-slate-200 pt-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-xl mb-4">
              <Wrench className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">For Contractors</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Showcase your skills and connect with businesses seeking your expertise. 
              The same powerful features, designed from your perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: UserPlus, title: "Professional Profile", description: "Create a compelling profile showcasing your skills" },
              { icon: Search, title: "Browse Job Opportunities", description: "Access curated jobs matching your expertise" },
              { icon: MessageSquare, title: "Connect with Businesses", description: "Reach out and showcase your value" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                  <p className="text-slate-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

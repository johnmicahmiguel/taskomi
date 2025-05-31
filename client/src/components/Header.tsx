import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };



  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">ConnectPro</h1>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="text-slate-600 hover:text-primary font-medium transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection("pricing")}
                className="text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection("testimonials")}
                className="text-slate-600 hover:text-primary font-medium transition-colors"
              >
                Testimonials
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-slate-600 hover:text-primary" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 pt-8">
                  <button 
                    onClick={() => scrollToSection("features")}
                    className="text-left text-slate-600 hover:text-primary font-medium p-2"
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-left text-slate-600 hover:text-primary font-medium p-2"
                  >
                    How It Works
                  </button>
                  <button 
                    onClick={() => scrollToSection("pricing")}
                    className="text-left text-slate-600 hover:text-primary font-medium p-2"
                  >
                    Pricing
                  </button>
                  <button 
                    onClick={() => scrollToSection("testimonials")}
                    className="text-left text-slate-600 hover:text-primary font-medium p-2"
                  >
                    Testimonials
                  </button>
                  <div className="pt-4 border-t space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}

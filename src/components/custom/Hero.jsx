import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";

export default function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated, googleLogin } = useAuth(); // Get authentication state and login function from context
  const [openDialog, setOpenDialog] = useState(false); // State for the dialog

  const handleGetStartedClick = () => {
    if (isAuthenticated) {
      navigate("/create-proposal"); // Navigate if authenticated
    } else {
      setOpenDialog(true); // Open dialog for unauthenticated users
    }
  };

  const handleGoogleLogin = async () => {
    await googleLogin();
    setOpenDialog(false); // Close dialog after login
    navigate("/create-proposal"); // Navigate to create proposal after successful login
  };

  return (
    <section className="fixed inset-0 w-full h-screen overflow-hidden"> 
      <div className="container mx-auto px-4 py-16 sm:py-24 h-full flex items-center"> 
        <div className="flex flex-col lg:flex-row items-center gap-9 h-full"> 
          <div className="flex flex-col items-center lg:items-start lg:w-1/2">
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-center lg:text-left">
              <span className="text-[#0085FF] dark:text-[#40A9FF]">
                Unleash Your Business Potential with AI: 
              </span>{" "} 
              Tailored Proposals at Your Command
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-center lg:text-left mt-6">
              Your personal business consultant, crafting custom proposals tailored to your goals and needs.
            </p>
            <Button onClick={handleGetStartedClick} size="lg" className="mt-8 px-8 py-3 text-lg">
              Get Started
            </Button>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <img
              src="hero.jpg"
              alt="AI-powered trip planning interface"
              className="w-full h-auto object-cover rounded-lg" 
            />
          </div>
        </div>
      </div>

      {/* Dialog for Google Sign-In */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>Please log in to access your account.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <Button className="flex items-center justify-center w-full mt-4" onClick={handleGoogleLogin}>
              <FcGoogle className="mr-2" />
              Sign in with Google
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { EmployerDashboard } from "@/components/dashboard/EmployerDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";

const Index = () => {
  // This is temporary - will be replaced with proper auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<"employer" | "staff">("staff");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {!isLoggedIn ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <LoginForm />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {userType === "employer" ? <EmployerDashboard /> : <StaffDashboard />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-full max-w-md space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

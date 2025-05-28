import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

const ErrorAlert = ({ message }) => {
  return (
    <Alert variant="destructive" className="bg-red-500/10 border-red-500 text-red-400">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>BIG ERRROR</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;

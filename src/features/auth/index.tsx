import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "./util/schemas";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { useAuth } from "./hooks/use-auth";

const Auth = () => {
  const { user, isLoading, isSubmitting, handleLogin, handleRegister } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const success = await handleRegister(data);
    if (success) {
      setActiveTab("login");
    }
  };

  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-center">Welcome to SyncStack</CardTitle>
          <CardDescription className="text-center">
            {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm
                form={loginForm}
                onSubmit={handleLogin}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <RegisterForm
                form={registerForm}
                onSubmit={onRegisterSubmit}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center pb-6 pt-0">
          <p className="text-sm text-muted-foreground">
            {activeTab === "login" 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
              type="button"
            >
              {activeTab === "login" ? "Register" : "Login"}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;

import { Card } from "@heroui/react";
import { LoginForm, RegisterForm } from "@/components/forms";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        {
          !isLogin ?
            <Card.Header>
              <Card.Title
                className="text-center text-2xl"
              >
                Crie sua conta
              </Card.Title>
            </Card.Header>
          : null
        }
        {
            isLogin ?
            <LoginForm
                setIsLogin={setIsLogin}
            /> :
            <RegisterForm 
                setIsLogin={setIsLogin}
            />
        }
      </Card>
    </div>
  );
}
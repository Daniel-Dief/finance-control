import { Card } from "@heroui/react";
import { LoginForm, RegisterForm } from "@/components/forms";
import { useState } from "react";
import GradientWaves from "@/components/ui/GradientWaves";
import { ThemeStore } from "@/stores/themeStore";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { theme } = ThemeStore();

  const colors = {
    horizonColor: theme === "light" ? "#3300ff" : "#5227FF",
    waveColor: theme === "light" ? "#3401ff" : "#FF9FFC",
    crestColor: theme === "light" ? "#350ed4" : "#FFFFFF",
  }

  return (
    <div className={`w-full h-screen relative flex justify-center items-center ${theme === "light" ? "bg-white" : "bg-gray-900"}`}>
      <div className="w-full h-full absolute">
        <GradientWaves
          horizonColor={colors.horizonColor}
          waveColor={colors.waveColor}
          crestColor={colors.crestColor}
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={0.2}
          zoom={0.7}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={1}
          opacity={1}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.05}
        />
      </div>
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
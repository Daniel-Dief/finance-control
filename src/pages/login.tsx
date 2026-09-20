import { Card } from "@heroui/react";
import { LoginForm, RegisterForm } from "@/components/forms";
import { useState } from "react";
import GradientWaves from "@/components/ui/GradientWaves";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full h-screen relative flex justify-center items-center">
      <div className="w-full h-[600px] absolute">
        <GradientWaves
          horizonColor="#5227FF"
          waveColor="#FF9FFC"
          crestColor="#FFFFFF"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
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
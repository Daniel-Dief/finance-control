import { Card } from '@heroui/react';
import { useState } from 'react';

import { LoginForm, RegisterForm } from '@/components/forms';
import GradientWaves from '@/components/ui/GradientWaves';
import { useThemeContext } from '@/components/theme-provider';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { resolvedTheme } = useThemeContext();

  const colors = {
    horizonColor: resolvedTheme === 'light' ? '#3300ff' : '#5227FF',
    waveColor: resolvedTheme === 'light' ? '#3401ff' : '#FF9FFC',
    crestColor: resolvedTheme === 'light' ? '#350ed4' : '#FFFFFF'
  };

  return (
    <div
      className={`w-full h-screen relative flex justify-center items-center ${resolvedTheme === 'light' ? 'bg-white' : 'bg-gray-900'}`}
    >
      <div className="w-full h-full absolute">
        <GradientWaves
          grain
          mouseInteraction
          amplitude={2.5}
          brightness={1}
          crestColor={colors.crestColor}
          detail="medium"
          fogDepth={15}
          grainIntensity={0.05}
          height={5.5}
          horizonColor={colors.horizonColor}
          opacity={1}
          parallaxStrength={0.5}
          speed={0.4}
          swell={35}
          tilt={0.2}
          turbulence={20}
          waveColor={colors.waveColor}
          waveRatio={0.9}
          waveScale={0.6}
          zoom={0.7}
        />
      </div>
      <Card
        className={`w-full max-w-md rounded-lg ${resolvedTheme === 'dark' ? 'bg-[#101828]' : ''}`}
      >
        <Card.Header>
          <Card.Title
            className={`text-center text-2xl ${resolvedTheme === 'dark' ? 'text-white' : ''}`}
          >
            {isLogin ? 'Entrar' : 'Crie sua conta'}
          </Card.Title>
        </Card.Header>
        {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
      </Card>
    </div>
  );
}

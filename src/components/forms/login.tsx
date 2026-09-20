import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  FieldError,
  Form,
  Input,
  Label,
  TextField
} from "@heroui/react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
}

export default function LoginForm({ setIsLogin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const login = String(formData.get("login") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsLoading(true);

    try {
      const { token, user } = await authService.login({ login, password });

      useAuthStore.getState().login(token, user, password);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Login ou senha inválidos. Verifique e tente novamente.");
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card.Content>
        <div className="flex flex-col gap-4">
          {error && (
            <Alert status="danger" className="bg-red-100 text-red-800">
              <Alert.Indicator />
              <Alert.Content >
                <Alert.Title>Erro de autenticação</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <TextField autoFocus isRequired name="login">
            <Label>Login</Label>
            <Input placeholder="Seu login" variant="secondary" />
            <FieldError />
          </TextField>
          <TextField isRequired minLength={6} name="password" type="password">
            <Label>Senha</Label>
            <Input placeholder="******" variant="secondary" />
            <FieldError>Digite uma senha com pelo menos 6 caracteres</FieldError>
          </TextField>
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button
          onPress={() => setIsLogin(false)}
          variant="tertiary"
          >
          Cadastre-se
        </Button>
        <Button
          variant="primary"
          type="submit"
          isPending={isLoading}
        >
          {({ isPending }) => (isPending ? "Entrando..." : "Entrar")}
        </Button>
      </Card.Footer>
    </Form>
  );
}
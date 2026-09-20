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
  TextField,
} from "@heroui/react";

import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
}

export default function RegisterForm({ setIsLogin }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const login = String(formData.get("login") ?? "");
    const name = String(formData.get("name") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsLoading(true);

    try {
      await authService.register({ login, name, password });

      const { token, user } = await authService.login({ login, password });

      useAuthStore.getState().login(token, user, password);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Já existe um usuário cadastrado com esse login.");
      } else {
        setError("Não foi possível concluir o registro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Card.Content>
        <div className="flex flex-col gap-4">
          {error && (
            <Alert status="danger" className="bg-red-100 text-red-800">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Erro no registro</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <TextField autoFocus isRequired name="login">
            <Label>Login</Label>
            <Input placeholder="Seu login" variant="secondary" />
            <FieldError />
          </TextField>
          <TextField isRequired name="name">
            <Label>Nome</Label>
            <Input placeholder="Seu nome completo" variant="secondary" />
            <FieldError />
          </TextField>
          <TextField isRequired minLength={6} name="password" type="password">
            <Label>Senha</Label>
            <Input placeholder="••••••••" variant="secondary" />
            <FieldError>Digite uma senha com pelo menos 6 caracteres</FieldError>
          </TextField>
        </div>
      </Card.Content>
      <Card.Footer className="mt-4 flex justify-between gap-2">
        <Button
          onPress={() => setIsLogin(true)}
          variant="tertiary"
          >
          Entrar
        </Button>
        <Button
          variant="primary"
          type="submit"
          isPending={isLoading}
        >
          {({ isPending }) => (isPending ? "Cadastrando..." : "Cadastrar")}
        </Button>
      </Card.Footer>
    </Form>
  );
}
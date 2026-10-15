import type { Key } from "@heroui/react";

interface ValidateResult {
    isValid: boolean;
    error: string;
}

export function formsCategoriesValidate(name : string) : ValidateResult {
  if (!name.trim()) {
    return {
      isValid: false,
      error: "Informe o nome da categoria."
    }
  }

  return {
      isValid: true,
      error: ""
  }
}

interface formsBudgetsValidateProps {
  areaSize: number;
  areaId: Key | null;
  month: Key | null;
  year: number;
  amountCents: number | null;
}

export function formsBudgetsValidate(props: formsBudgetsValidateProps) : ValidateResult {
  if (props.areaSize === 0) {
    return {
      isValid: false,
      error: "Cadastre uma área antes de criar um orçamento."
    };
  }

  if (props.areaId === null) {
    return {
      isValid: false,
      error: "Selecione uma área."
    };
  }

  if (props.month === null) {
    return {
      isValid: false,
      error: "Selecione o mês."
    };
  }

  if (!Number.isFinite(props.year) || props.year < 1) {
    return {
      isValid: false,
      error: "Informe um ano válido."
    };
  }

  if (props.amountCents === null) {
    return {
      isValid: false,
      error: "Informe o valor do orçamento."
    };
  }

  return {
    isValid: true,
    error: ""
  }
}

export function formsAreasValidate(name : string) : ValidateResult {
  if (!name.trim()) {
    return {
      isValid: false,
      error: "Informe o nome da área."
    }
  }

  return {
      isValid: true,
      error: ""
  }
}

import axios, { AxiosError } from "axios";

export function formsCategoriesErrors(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 409) {
    return "Já existe uma categoria com esse nome.";
  } else if (status === 400) {
    return "Dados inválidos. Verifique o nome informado.";
  } else return null;
}

export function deleteCategoriesValidate(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 404) {
    return "Categoria não encontrada. Ele pode já ter sido removido.";
  }

  return null;
}

export function formsBudgestErrors(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 409) {
    return "Já existe uma categoria com esse nome.";
  } else if (status === 400) {
    return "Dados inválidos. Verifique o nome informado.";
  } else return null;
}

export function deleteBudgetsValidate(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 404) {
    return "Orçamento não encontrado. Ele pode já ter sido removido.";
  } else return null;
}

export function formsAreasErros(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 409) {
    return "Já existe uma área com esse nome.";
  } else if (status === 400) {
    return "Dados inválidos. Verifique o nome informado.";
  }

  return null;
}

export function deleteAreasValidate(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 404) {
    return "Área não encontrada. Ela pode já ter sido removida.";
  } else return null;
}

export function formsTransactionsErrors(err: AxiosError | any): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 400) {
    return "Dados inválidos. Verifique os campos informados.";
  } else if (status === 404) {
    return "Transação não encontrada. Ela pode já ter sido removida.";
  } else return null;
}

export function deleteTransactionsValidate(
  err: AxiosError | any,
): string | null {
  if (!axios.isAxiosError(err)) return null;
  const status = err.response?.status;

  if (status === 404) {
    return "Transação não encontrada. Ela pode já ter sido removida.";
  } else return null;
}

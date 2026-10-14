import axios, { AxiosError } from "axios";

export function formsCategoriesErrors(err : AxiosError | any) : string | null{
    if(!axios.isAxiosError(err)) return null;
    const status = err.response?.status;

    if (status === 409) {
        return "Já existe uma categoria com esse nome.";
    } else
    if (status === 400) {
        return "Dados inválidos. Verifique o nome informado.";
    } else
    return null;
}

export function deleteCategoriesValidate(err : AxiosError | any) : string | null {
    if(!axios.isAxiosError(err)) return null;
    const status = err.response?.status;

    if (status === 409) {
        return "Já existe uma categoria com esse nome.";
    } else
    if (status === 400) {
        return "Dados inválidos. Verifique o nome informado.";
    } else
    return null;
}
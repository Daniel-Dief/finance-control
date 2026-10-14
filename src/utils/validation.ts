interface ValidateResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export function formsCategoriesValidate(name : string) : ValidateResult {
    if (!name.trim()) {
      return {
        isValid: false,
        errors: {
          name: "Informe o nome da categoria."
        }
      }
    }

    return {
        isValid: true,
        errors: {}
    }
}
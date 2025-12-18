export function formatCedula(value: string | number| undefined): string {
  // Convertir a string y eliminar cualquier carácter que no sea número
  const clean = String(value).replace(/\D/g, "");

  // Aplicar formato con puntos cada 3 dígitos desde el final
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

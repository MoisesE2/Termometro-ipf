// src/models/Cota.ts
export interface Cota {
  id?: string;
  valor: number;
  descricao?: string;
  data?: string;
  responsavel?: string;
  nome?: string;
  cpf?: string;
  observacoes?: string;
  temComprovante?: boolean;
  createdAt?: string;
  updatedAt?: string;
  imagem?: File | null; 
}

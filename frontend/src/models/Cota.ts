// src/models/Cota.ts
export interface Cota {
  id?: number;
  valor: number;
  descricao: string;
  data: string;
  responsavel: string;
  imagem?: File | null; 
}

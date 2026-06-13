// src/services/api.ts
// Camada de serviço — responsável por buscar dados externos.
// O React não fala direto com o Google Sheets — passa por aqui.
// Se um dia trocar de fonte de dados, só muda esse arquivo.

import type { CustoExtra } from '../types'

const API_URL = 'https://script.google.com/macros/s/AKfycbyLidef0PR2FV8sfGwnZjLz5bu0mBEMO6rQTKr_cjpBPErfIo8MNaN5OHU-kTDfWCcX/exec'

export async function buscarDados(): Promise<CustoExtra[]> {
  const resposta = await fetch(API_URL)
  const json = await resposta.json()
  
  //CASO DER ERRO NA REQUISIÇÃO
  if (!json.sucesso) {
    throw new Error(json.erro || 'Erro ao buscar dados')
  }
  
  return json.dados as CustoExtra[]
}
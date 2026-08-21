export const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

export const NORTE = new Set(["Acre", "Amapá", "Amazonas", "Pará", "Rondônia", "Roraima", "Tocantins"]);
export const NORDESTE = new Set(["Alagoas", "Bahia", "Ceará", "Maranhão", "Paraíba", "Pernambuco", "Piauí", "Rio Grande do Norte", "Sergipe"]);
export const CENTRO_OESTE = new Set(["Distrito Federal", "Goiás", "Mato Grosso", "Mato Grosso do Sul"]);
export const SUDESTE = new Set(["Espírito Santo", "Minas Gerais", "Rio de Janeiro", "São Paulo"]);
export const SUL = new Set(["Paraná", "Rio Grande do Sul", "Santa Catarina"]);

export const ESTADOS_POR_REGIAO = [
  { regiao: "Norte", estados: Array.from(NORTE) },
  { regiao: "Nordeste", estados: Array.from(NORDESTE) },
  { regiao: "Centro-Oeste", estados: Array.from(CENTRO_OESTE) },
  { regiao: "Sudeste", estados: Array.from(SUDESTE) },
  { regiao: "Sul", estados: Array.from(SUL) },
];

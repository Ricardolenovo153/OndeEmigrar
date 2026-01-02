-- ==========================================================
-- PROJETO: QUERO EMIGRAR - CONJUNTO DE QUERIES PARA AVALIAÇÃO
-- ==========================================================

-- 1. MÉDIA DE INDICADORES POR REGIÃO (GROUP BY & JOIN)
-- Objetivo: Analisar quais as regiões com melhor qualidade de vida média em 2020.
SELECT 
    region.region_name,
    ROUND(AVG(indicator.life_expectancy), 1) AS media_esperanca_vida,
    ROUND(AVG(indicator.gdp_per_capita), 0) AS media_pib_capita,
    ROUND(AVG(indicator.political_stability), 1) AS media_estabilidade_politica
FROM indicator
JOIN country ON indicator.country_id = country.id_country
JOIN region ON country.region_id = region.id_region
WHERE indicator.year = 2020
GROUP BY region.region_name
ORDER BY media_pib_capita DESC;


-- 2. EVOLUÇÃO DO PIB PER CAPITA (1990 vs 2020)
-- Objetivo: Identificar países que tiveram o maior crescimento económico em 30 anos.
SELECT 
    c.country_name,
    i1.gdp_per_capita AS pib_1990,
    i2.gdp_per_capita AS pib_2020,
    ROUND(((i2.gdp_per_capita - i1.gdp_per_capita) / i1.gdp_per_capita) * 100, 2) AS crescimento_percentual
FROM country c
JOIN indicator i1 ON c.id_country = i1.country_id AND i1.year = 1990
JOIN indicator i2 ON c.id_country = i2.country_id AND i2.year = 2020
WHERE i1.gdp_per_capita > 0
ORDER BY crescimento_percentual DESC
LIMIT 10;


-- 3. PAÍSES COM "EQUILÍBRIO PERFEITO" (MÚLTIPLOS FILTROS)
-- Objetivo: Encontrar países que são estáveis, têm boa educação e baixa emigração.
SELECT 
    country.country_name,
    indicator.political_stability,
    indicator.tertiary_education,
    indicator.share AS taxa_emigracao
FROM indicator
JOIN country ON indicator.country_id = country.id_country
WHERE indicator.year = 2020
  AND indicator.political_stability > 70
  AND indicator.tertiary_education > 50
  AND indicator.share < 5
ORDER BY indicator.political_stability DESC;


-- 4. ANÁLISE DE CORRELAÇÃO: DESEMPREGO VS SUB-NUTRIÇÃO
-- Objetivo: Verificar o impacto social em países com alto desemprego.
SELECT 
    country.country_name,
    indicator.unemployment AS taxa_desemprego,
    indicator.undernourishment AS taxa_subnutricao,
    indicator.life_expectancy
FROM indicator
JOIN country ON indicator.country_id = country.id_country
WHERE indicator.year = 2015 -- Usando 2015 pois tem mais dados de subnutrição
  AND indicator.unemployment IS NOT NULL
  AND indicator.undernourishment IS NOT NULL
ORDER BY indicator.unemployment DESC;


-- 5. RANKING PERSONALIZADO COM CÁLCULO DE GAP (A QUERY DO PROJETO)
-- Objetivo: Calcular o score final e a diferença para o primeiro lugar.
SET @max_score = (
    SELECT MAX((gdp_per_capita/1000*20) + (life_expectancy*20) + (tertiary_education*2*20) + (political_stability*10*15) + (rule_oflaw*10*15) - (share*5*10))
    FROM indicator WHERE year = 2020
);

SELECT 
    country.country_name, 
    ROUND((
        (indicator.gdp_per_capita / 1000 * 20) + 
        (indicator.life_expectancy * 20) + 
        (indicator.tertiary_education * 2 * 20) + 
        (indicator.political_stability * 10 * 15) + 
        (indicator.rule_oflaw * 10 * 15) - 
        (indicator.share * 5 * 10)
    ), 0) AS score_final,
    ROUND((
        (indicator.gdp_per_capita / 1000 * 20) + 
        (indicator.life_expectancy * 20) + 
        (indicator.tertiary_education * 2 * 20) + 
        (indicator.political_stability * 10 * 15) + 
        (indicator.rule_oflaw * 10 * 15) - 
        (indicator.share * 5 * 10)
    ) - @max_score, 0) AS gap_score
FROM indicator 
JOIN country ON indicator.country_id = country.id_country
WHERE indicator.year = 2020
ORDER BY score_final DESC 
LIMIT 10;


-- 6. CRIAÇÃO DE UMA VIEW PARA FACILITAR CONSULTAS (DATABASE OBJECTS)
-- Objetivo: Criar uma "tabela virtual" que já contém os dados mais recentes limpos.
CREATE OR REPLACE VIEW view_dados_recentes AS
SELECT 
    c.country_name,
    r.region_name,
    i.year,
    i.gdp_per_capita,
    i.life_expectancy,
    i.political_stability
FROM indicator i
JOIN country c ON i.country_id = c.id_country
JOIN region r ON c.region_id = r.id_region
WHERE i.year = 2020;

-- Exemplo de uso da View:
SELECT * FROM view_dados_recentes WHERE region_name = 'Europe' AND gdp_per_capita > 40000;


-- 7. CONTAGEM DE PAÍSES POR REGIÃO COM FILTRO DE PIB (HAVING)
-- Objetivo: Mostrar regiões que têm mais de 5 países com PIB per capita acima de 10.000.
SELECT 
    region.region_name,
    COUNT(country.id_country) AS total_paises_ricos
FROM region
JOIN country ON region.id_region = country.region_id
JOIN indicator ON country.id_country = indicator.country_id
WHERE indicator.year = 2020 AND indicator.gdp_per_capita > 10000
GROUP BY region.region_name
HAVING total_paises_ricos > 5
ORDER BY total_paises_ricos DESC;

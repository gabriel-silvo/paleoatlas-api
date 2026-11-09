# Escopo e contrato inicial

## Objetivo

Oferecer uma API pública, legível e rastreável de gêneros de dinossauros não avianos e suas espécies. O catálogo deve ser útil a projetos educacionais e ao futuro RPG, mantendo a ciência independente das regras do jogo.

PaleoAtlas API é o nome escolhido pelo proprietário em 9 de novembro de 2026. A escolha não constitui pesquisa de marca ou domínio.

## Regras acordadas

1. Incluir dinossauros não avianos; outros animais pré-históricos ficam fora do escopo.
2. Consultas centrais são por gênero. A resposta inclui dados gerais e espécies associadas, com binômio completo e epíteto.
3. Gêneros aceitos e nomes históricos são conceitos distintos. Dynamosaurus pode resolver para Tyrannosaurus com aviso e origem da relação.
4. Um nome duvidoso ou inválido sem destino seguro não recebe um destino inventado.
5. O objetivo científico é cobrir nomes formalmente descritos e gêneros atualmente aceitos. A primeira implementação usa os candidatos aceitos pela PBDB; ela ainda não constitui auditoria completa de disponibilidade nomenclatural ou consenso.
6. Medidas precisam de fontes e unidades. Localidades, intervalos e classificações admitem múltiplas evidências e revisões.

## Recorte operacional da versão 0.1

Fonte: PBDB Data Service 1.2. Subárvore Dinosauria com exclusão conjunta de Aves e Avialae, categoria gênero ou espécie, `taxon_status=accepted`, `pres=regular`, `published=yes`. Para nomes históricos, usar o mesmo recorte com `taxon_status=all` e aceitar apenas sinonímia subjetiva, objetiva ou substituição cujo alvo seja elegível.

Esses filtros dependem da classificação e do preenchimento da PBDB. Por exemplo, um táxon de posição discutida pode permanecer no conjunto e uma espécie pode não herdar corretamente a categoria de preservação do gênero. O importador exige associação segura a um gênero elegível e um binômio consistente; os demais casos entram no relatório de quarentena.

Os registros consultáveis são marcados `source_status=accepted` e `curation_status=imported_unreviewed`. Ausência de espécies na resposta de um gênero significa ausência de espécies publicadas neste snapshot, não prova de que não existam espécies descritas.

## Critérios de aceite da primeira versão

- Listas paginadas de gêneros e espécies, consulta por nome e ID e descoberta de recursos.
- Consulta de gênero com espécies associadas e nomes históricos.
- Resolução histórica rastreável, HTTP 409 para nomes ambíguos e HTTP 404 para ausentes.
- Documentação OpenAPI, metadados de cobertura, atribuição e datas de coleta.
- Importação em lote, rascunho, relatório de diferenças de contagem, quarentena e promoção local separada.
- Snapshot incluído que funciona sem banco; armazenamento opcional em PostgreSQL.
- Evidências brutas compactadas, com hashes e teste de reconstrução do snapshot.
- Testes de contrato, validação dos dados e integração PostgreSQL na CI.

## Fora da versão inicial

Cadastro de jogadores, cartas, atributos de combate, pagamento, painel de edição, escrita HTTP, imagens, medidas preenchidas, geografia, traduções e autenticação de consumidores. A API de consulta não oferece acesso administrativo. Hospedagem pública do processo HTTP é uma etapa operacional separada da publicação do repositório.

## Direção do próximo enriquecimento

Por instrução do proprietário em 2026-11-09, imagens ficam fora da próxima carga. O plano propõe medidas mínimas/máximas por gênero, países de achados e envelope temporal, preservando afirmações por espécie/espécime e sua incerteza. Esses recursos ainda não foram implementados; consultar [ENRICHMENT_PLAN.md](ENRICHMENT_PLAN.md).

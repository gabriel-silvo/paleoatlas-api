# 0001 — Aceitação atribuída à fonte e snapshots reproduzíveis

Status: aceita. Data: 2026-11-09.

## Contexto

O objetivo é cobrir gêneros de dinossauros não avianos e espécies formalmente descritas. A PBDB oferece uma classificação calculada a partir de opiniões e publicações, mas inclui posicionamentos discutidos, homônimos e inconsistências. Consultar a fonte ao vivo a cada requisição faria a resposta depender de sua disponibilidade e mudaria o catálogo sem revisão ou explicação.

## Decisão

Usar a PBDB como autoridade operacional inicial, marcando aceitação e data da fonte separadamente de revisão científica do projeto. Importar três conjuntos em lote, conservar suas evidências e publicar snapshots validados. Preservar identidade por ID e expor ambiguidade; reter associações inseguras em quarentena. Servir snapshots em memória, com arquivo versionado como opção inicial e PostgreSQL como armazenamento opcional de versões.

## Alternativas e consequências

Curadoria integral antes da primeira publicação daria maior controle científico, mas atrasaria a construção e impediria um índice inicial útil. Proxy direto da PBDB reduziria a persistência própria, mas não permitiria revisão ou disponibilidade independente. A opção escolhida oferece rastreabilidade e utilidade inicial, ao custo de espaço para evidências, etapas de promoção e indicação persistente de que os dados importados ainda não foram revisados. A definição de uma autoridade curatorial independente e a inclusão de múltiplas fontes exigirão nova decisão e um modelo de sobreposições explícitas.

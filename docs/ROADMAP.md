# Próximas etapas

## Entregue na versão inicial

- Catálogo taxonômico com consulta por gênero e espécies associadas.
- Aliases históricos com relação explícita da PBDB.
- Quarentena, ambiguidade por nome, referências, hashes e evidências reproduzíveis.
- OpenAPI, testes, CI com PostgreSQL e coleta semanal de rascunhos.
- Snapshot local e armazenamento PostgreSQL opcionais.

## Próximo trabalho de dados

1. Revisar os dois registros Saurornithoides e os 36 casos de espécies em quarentena; documentar as decisões sem sobrescrever evidências.
2. Investigar casos limítrofes e posicionamentos antigos entre os gêneros candidatos, especialmente na fronteira de Dinosauria e Avialae.
3. Automatizar diferenças por ID e campos entre snapshots, com histórico de remoções e sinonímias.
4. Importar ocorrências e referências em lotes; derivar localidades e intervalos com semântica documentada.
5. Criar afirmações científicas com fonte por campo e armazenamento de decisões curatoriais.
6. Selecionar conjuntos científicos de medidas, preservando métodos, espécimes e intervalos; começar por um grupo pequeno revisado.
7. Adicionar imagens licenciadas, créditos e descrições em português com revisão.

## Operação

- Escolher um provedor e publicar o processo HTTP; o GitHub sozinho não executa a API.
- Ativar alertas de coleta e saúde, backups e teste de recuperação.
- Avaliar cotas por consumidor e cache compartilhado quando o tráfego justificar.
- Adicionar um registro de migrações antes de introduzir uma segunda migração de banco.

## Critério de evolução

Ampliar cobertura sem reduzir rastreabilidade. Quantidade de registros importados, fichas revisadas e campos preenchidos devem ser indicadores diferentes. Nenhuma etapa implica promessa de 100% de atualização em relação a toda a literatura.

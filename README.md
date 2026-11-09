# PaleoAtlas API

API de consulta de dinossauros não avianos, com gêneros, espécies, nomes históricos e referências rastreáveis. Projeto independente, inspirado na experiência de consumo da PokéAPI; não é um serviço oficial da PBDB.

**Estado: versão inicial de taxonomia, com importação ainda não revisada cientificamente.** Os registros refletem a classificação da fonte na data da coleta. Medidas, localidades, períodos e imagens ainda não são oferecidos.

## Primeira carga — 9 de novembro de 2026

| Indicador | Quantidade |
| --- | ---: |
| Registros de gênero aceitos na consulta à PBDB | 1.323 |
| Nomes distintos de gênero | 1.322 |
| Espécies publicadas no snapshot | 1.430 |
| Nomes históricos com destino seguro | 150 |
| Espécies em quarentena para revisão | 36 |

O total de gêneros é **um resultado operacional da PBDB, não um censo universal de gêneros formalmente disponíveis e consensualmente válidos**. Dois registros de Saurornithoides têm o mesmo nome e identificadores distintos. A API preserva os registros e informa ambiguidade em vez de escolher um arbitrariamente. A consulta exclui Aves e Avialae, ichnotáxons, form táxons e fontes não publicadas. Veja a [pesquisa e consulta reproduzível](docs/research/pbdb-count-and-pokeapi.md) e o [relatório da carga](data/import-report.json).

## Executar localmente

Requer Node.js 24 ou superior e npm. O snapshot incluído permite começar sem banco ou conexão à PBDB.

```sh
npm ci
npm run dev
```

- API: http://localhost:3000/api/v1/
- Documentação interativa: http://localhost:3000/docs
- OpenAPI: http://localhost:3000/docs/json
- Saúde: http://localhost:3000/health

Copie `.env.example` para `.env` apenas se precisar alterar a configuração. Para executar o compilado:

```sh
npm run build
npm start
```

## Consultas

```text
GET /api/v1/genera?limit=20&offset=0
GET /api/v1/genera?search=tyranno
GET /api/v1/genera/tyrannosaurus
GET /api/v1/genera/pbdb-38613
GET /api/v1/genera/dynamosaurus
GET /api/v1/species/tyrannosaurus-rex
GET /api/v1/catalog
GET /api/v1/sources
```

Uma consulta por gênero retorna `data` com os dados gerais, `species` e `historical_names`; `resolution` informa o nome solicitado e eventual resolução histórica. O snapshot da PBDB associa Tyrannosaurus rex e Tyrannosaurus mcraeensis ao gênero Tyrannosaurus. Essa aceitação é atribuída à fonte, sem alegação de consenso universal.

Listas seguem o padrão `count`, `next`, `previous`, `results`. Links são relativos à origem da API. O padrão é 20 resultados; o limite máximo é 100. IDs são namespaced, por exemplo `pbdb-38613`, preservando a identidade da fonte. Nomes são consultáveis sem distinção de maiúsculas; espécies usam o binômio com hífen. Um nome com múltiplos destinos retorna **409** com os identificadores disponíveis. Um nome desconhecido retorna **404**. Parâmetros inválidos retornam **400**.

## Atualização e revisão

```sh
npm run data:sync
# Inspecione data/staging/catalog.json e data/staging/report.json.
npm run data:publish
npm run data:archive
npm run check
```

`data:sync` faz três consultas em lote e produz um rascunho; não altera o catálogo servido. `data:publish` promove o rascunho local após validação. `data:archive` conserva as respostas originais compactadas. Reinicie o servidor após promover uma versão. Novas versões devem incluir catálogo, relatório e evidências no mesmo commit.

O workflow semanal **PBDB draft refresh** baixa rascunhos e guarda artefatos por 30 dias. A publicação continua sendo uma etapa de revisão. Sincronização com a PBDB não garante atualização imediata em relação a toda a literatura científica.

## PostgreSQL e hospedagem

PostgreSQL é opcional nesta primeira versão. Ele armazena snapshots imutáveis e um ponteiro transacional para a versão publicada; a API carrega a versão validada na inicialização. Consulte [arquitetura](docs/ARCHITECTURE.md) e [operação e hospedagem](docs/DEPLOYMENT.md).

O repositório é público e a API foi desenhada para leitura pública sem chave. Publicar código no GitHub **não coloca o servidor HTTP online**. `private: true` no package.json apenas impede publicação acidental no registro npm.

## Documentação do projeto

- [Retomar o trabalho em outra conversa](docs/HANDOFF.md)
- [Plano de carga de medidas, países e idade](docs/ENRICHMENT_PLAN.md)
- [Auditoria do catálogo legado](docs/research/legacy-catalog-audit.md)

- [Escopo e critérios de aceite](docs/SCOPE.md)
- [Glossário do domínio](CONTEXT.md)
- [Instruções para agentes](AGENTS.md)
- [Política de dados e curadoria](docs/DATA_POLICY.md)
- [Decisão de snapshots e autoridade taxonômica](docs/adr/0001-source-backed-catalog.md)
- [Próximas etapas](docs/ROADMAP.md)
- [Como contribuir](CONTRIBUTING.md)
- [Licença dos dados](DATA_LICENSE.md)

## Licenças

Código sob [MIT](LICENSE). Dados derivados da Paleobiology Database e referências sob [CC BY 4.0](DATA_LICENSE.md), com atribuição à PBDB, seus colaboradores e referências originais. As transformações são feitas pelo PaleoAtlas API. Imagens não estão incluídas; futuras imagens terão licença individual. Este projeto não distribui conteúdo Pokémon.

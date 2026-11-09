# Contagem inicial da PBDB e referências da PokéAPI

Pesquisa e consultas realizadas em 2026-11-09, fuso America/Sao_Paulo.

## Resultado reproduzível

A PBDB retornou **1.323 registros de gênero com identificadores distintos e 1.322 nomes distintos** com a consulta abaixo. Este é um censo operacional de candidatos aceitos pela classificação atual da PBDB, e não uma prova de que existem exatamente 1.323 gêneros universalmente aceitos por toda a comunidade científica. A validação posterior encontrou Saurornithoides em dois registros aceitos, com autoria e família diferentes; o projeto preserva ambos por ID e retorna ambiguidade na busca pelo nome.

```text
https://paleobiodb.org/data1.2/taxa/list.json?base_name=Dinosauria%5EAves%5EAvialae&rank=genus&taxon_status=accepted&pres=regular&published=yes&limit=all&show=attr,class,ref,crmod
```

Parâmetros conferidos no [código oficial do serviço](https://github.com/paleobiodb/data_service/blob/master/lib/PB2/TaxonData.pm):

- `base_name=Dinosauria^Aves^Avialae`: descendentes de Dinosauria, excluindo ambas as subárvores avianas nomeadas na PBDB.
- `rank=genus`: gêneros, sem confundi-los com espécies.
- `taxon_status=accepted`: nomes taxonomicamente válidos que não são sinônimos juniores segundo a PBDB.
- `pres=regular`: exclui ichnotáxons e form táxons, como gêneros baseados em pegadas e certos ovos.
- `published=yes`: nomes provenientes de fontes publicadas; isso é um filtro de procedência, não uma auditoria independente de disponibilidade nomenclatural conforme o ICZN.
- `limit=all`: evita truncamento por paginação.
- `show=attr,class,ref,crmod`: autoria, classificação, referência de entrada e datas de criação/modificação.

A resposta retornou 1.323 objetos, 1.323 valores `oid` distintos, todos `rnk=genus`, sem flags de ichnotáxon/form táxon e sem avisos na resposta. SHA-256 do JSON bruto recebido: `974ace89c8f9fae1fcb0922f4c59d4294b99b92b22617c8afb3b3f95410ce560`.

### Por que excluir Aves e Avialae?

Verificação empírica das consultas no mesmo dia:

| Exclusão | Registros | Problema observado |
| --- | ---: | --- |
| somente Aves | 1.601 | Ainda inclui Archaeopteryx, Ichthyornis, Hesperornis e Baminornis |
| somente Avialae | 2.951 | Ainda inclui o ramo de aves excluído por Aves |
| Aves e Avialae | 1.323 | Exclui esses gêneros e Gallus; preserva Tyrannosaurus e Velociraptor |

A classificação da PBDB exige a exclusão conjunta neste snapshot. Não substituir a consulta por `extant=no`: aves extintas continuam sendo aves. Anchiornis permanece no resultado porque a PBDB o coloca em Troodontidae; classificações filogenéticas alternativas podem mudar seu enquadramento. A fronteira de aves varia na literatura; documentar nossa política e revisar os casos limítrofes. Como referência primária sobre essa distinção, o capítulo [Basal Avialae, The Dinosauria](https://doi.org/10.1525/california/9780520242098.003.0013) discute Avialae e Aves/Neornithes.

### Limites científicos

- PBDB é uma base curada por contribuições e literatura, com decisões taxonômicas registradas, não um cartório mundial completo e instantâneo. A [publicação da API](https://www.cambridge.org/core/journals/paleobiology/article/the-paleobiology-database-application-programming-interface/4D20F5CAFA1B0AC7033975418668D82B) descreve seu modelo e suas opiniões taxonômicas.
- A consulta ainda inclui Nyasasaurus e Ancistrodon em posições próximas da raiz de Dinosauria. Isso demonstra que importação exige revisão de colocação, nomenclatura e atualidade das referências; não promover cada resultado automaticamente a uma ficha cientificamente revisada.
- Os campos `dcr` e `dmd` são datas do registro da fonte; não significam revisão científica por este projeto.
- Separar contagem de candidatos importados, contagem publicada e contagem revisada. Preservar snapshots permite explicar mudanças de contagem.
- Uma remoção futura de um gênero na fonte deve gerar revisão de sinônimo/colocação, preservando identificadores e histórico.

## Tyrannosaurus como exemplo

Consulta executada:

```text
https://paleobiodb.org/data1.2/taxa/list.json?base_name=Tyrannosaurus&rank=species&taxon_status=accepted&pres=regular&published=yes&limit=all&show=attr,ref
```

Retornou exatamente:

| Identificador PBDB | Espécie | Autoria |
| --- | --- | --- |
| txn:54833 | Tyrannosaurus rex | Osborn 1905 |
| txn:482540 | Tyrannosaurus mcraeensis | Dalman et al. 2024 |

O gênero é `txn:38613`. A espécie mcraeensis tem [descrição formal publicada em 2024](https://doi.org/10.1038/s41598-023-47011-0). A distinção entre espécie formalmente descrita e espécie atualmente aceita deve permanecer explícita. Há literatura posterior que a utiliza, como [o estudo de 2026 sobre um tiranossaurídeo do Campaniano](https://doi.org/10.1038/s41598-026-38600-w), e literatura crítica de taxonomia de Tyrannosaurus, como [Carr 2025](https://doi.org/10.1080/27669645.2025.2539638). O texto integral de Carr não pôde ser inspecionado por 403 nesta pesquisa; não atribuir ao artigo argumentos específicos sem leitura posterior. A API deve dizer “aceito pela PBDB neste snapshot”, evitando alegar consenso universal.

## Inspiração prática: PokéAPI

A [documentação oficial da PokéAPI v2](https://pokeapi.co/docs/v2) informa que é uma API de consulta, sem autenticação de leitura, com paginação e recursos nomeados. Adotar como inspiração de interface, sem reutilizar conteúdo Pokémon.

| Padrão observado | Aplicação proposta |
| --- | --- |
| Coleção paginada com `count`, `next`, `previous`, `results` | Listas de gêneros e espécies com limites máximos |
| Detalhe por ID ou nome | IDs estáveis e slugs científicos legíveis |
| Recursos relacionados com `name` e `url` | Espécies do gênero, referências e recursos taxonômicos |
| Objetos separados para Pokémon, espécie e forma | Manter gênero e espécie distintos; dados de jogo em outro domínio |
| Política de cache local | Cache HTTP e snapshots/exportações para evitar consultas repetidas |
| Campos e unidades documentados | Unidades explícitas, intervalos e origem para estimativas científicas |
| Modelos de nomes localizados | Nome científico canônico com textos de divulgação traduzíveis |

Diferenças necessárias: ciência requer fontes por afirmação, incerteza, sinônimos históricos e histórico de revisão. Não copiar estatísticas de combate ou uma cadeia evolutiva linear para o catálogo científico.

## Próximo preenchimento

Consultas em lote adicionais executadas nesta pesquisa, substituindo apenas `rank` e `taxon_status` na consulta principal:

| Recorte | Registros brutos | SHA-256 |
| --- | ---: | --- |
| `rank=species&taxon_status=accepted` | 1.466 | `8c99771044b1de26f88b232fbb43ca3a926072977e4114f74448518a4979c1ba` |
| `rank=genus&taxon_status=all` | 1.666 | `45edee17ec847eaebd475c9943a900b5efffa7bf1479de501d7925bcbcf5fb72` |

Das 1.466 espécies, a checagem preliminar encontrou **1.441** com `par` ou `gnl` associáveis aos gêneros aceitos; **25** tinham pendências nessa etapa. A implementação acrescentou consistência entre o binômio e o gênero associado: publicou **1.430 espécies** e conservou **36 em quarentena**, incluindo 11 casos adicionais de nomes/recombinações divergentes ou expressão com subgênero. Exemplos de pendência: Gresslyosaurus ingens, Titanosaurus blanfordi, Fuscinapedis woodbinensis e Subtiliolithus hyogoensis. `pres=regular` é aplicado a cada táxon: flags incompletas entre gênero e espécie podem deixar espécies relacionadas a ichnotáxons/form táxons no resultado. A associação e a coerência com gêneros elegíveis são filtros adicionais necessários. Consulte `data/import-report.json` para a lista efetivamente publicada e a quarentena completa.

Na lista de todos os gêneros, os nomes não aceitos se distribuem em 130 sinônimos subjetivos, 6 sinônimos objetivos, 14 substituídos, 185 nomina dubia, 7 nomina nuda e 1 nomen vanum. Um registro com nomen dubium/nudum não deve automaticamente redirecionar a um gênero válido. Exemplo de alias seguro no snapshot: Dynamosaurus (`oid=txn:56317`) tem `tdf=subjective synonym of`, `acc=txn:38613`, `acn=Tyrannosaurus`; sua busca pode resolver para o gênero Tyrannosaurus, preservando motivo e origem da sinonímia.

1. Arquivar o JSON bruto e um manifesto com URL, instante de coleta, filtros, hash e licença.
2. Importar o índice de gêneros como candidatos, preservando `oid`, referências e classificação.
3. Importar espécies em lote com os mesmos filtros e associá-las por identificador de gênero, em vez de fazer milhares de chamadas redundantes.
4. Consultar nomes históricos e seus `accepted_no`/`accepted_name`; criar aliases apenas quando o alvo for resolvido. Nomes inválidos sem sinônimo seguro devem ter status próprio, sem redirecionamento inventado.
5. Acrescentar ocorrências e intervalos geológicos com referências, depois estimativas de tamanho e imagens licenciadas.
6. Promover fichas revisadas e publicar diferenças entre snapshots. Medidas ausentes permanecem ausentes.

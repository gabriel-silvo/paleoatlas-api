# Dados, procedência e curadoria

## Fonte e autoridade

PBDB é a autoridade taxonômica operacional da primeira versão. A classificação da fonte é uma afirmação datada, não consenso universal. Nome descrito, nome nomenclaturalmente disponível e táxon aceito são questões diferentes. A API deve explicitar essas diferenças.

Cada táxon conserva ID, referência bibliográfica disponível e data de modificação da fonte. `source_modified_at` é uma data textual da PBDB, sem fuso documentado pelo importador; não converter silenciosamente para UTC. `retrieved_at` e `generated_at` são instantes UTC do nosso processo e não datas de revisão científica.

## Importação

1. Baixar gêneros, espécies e todos os nomes de gêneros em três consultas sequenciais. Milhares de chamadas individuais são desnecessárias para este índice.
2. Conservar os bytes brutos, a URL exata, o instante e o SHA-256 de cada resposta. Avisos da fonte, respostas vazias e erros interrompem a normalização.
3. Preservar os registros distintos da fonte mesmo quando compartilham um nome. Resolver nomes ambíguos por ID, nunca pelo primeiro item encontrado.
4. Associar espécie por gênero de destino ou nome não ambíguo; exigir binômio coerente. Recombinações e subgêneros que precisam de interpretação entram em quarentena nesta versão.
5. Resolver apenas relações históricas explícitas cujo alvo esteja presente. Nomina dubia/nuda/vana permanecem no relatório.
6. Gerar o rascunho em `data/staging`. O relatório inclui contagens anteriores, ambiguidades, quarentena, nomes históricos não resolvidos e caminho das respostas brutas.
7. Revisar mudanças, promover o catálogo local, arquivar evidências e executar os testes. O teste de evidência precisa reconstruir exatamente o snapshot publicado.

## Revisão da atualização

Antes de promover uma carga, verificar entradas e remoções por ID, variações expressivas de contagem, mudança de classificação, resolução de sinônimos, casos de fronteira aviana e alterações na quarentena. O relatório atual automatiza contagens e problemas de associação; a comparação detalhada por ID ainda é manual. Não declarar uma atualização cientificamente revisada apenas porque os testes passaram.

O workflow semanal coleta rascunhos para inspeção e guarda artefatos por 30 dias. A disponibilidade da PBDB e alterações de seu esquema podem interromper uma coleta. O snapshot publicado continua disponível. Ativar notificações do GitHub Actions e verificar falhas; tarefa agendada não significa manutenção científica autônoma permanente.

## Primeira carga

Em 2026-11-09, a PBDB retornou 1.323 registros de gênero, 1.322 nomes distintos e 1.466 espécies brutas. O importador publicou 1.430 espécies, colocou 36 em quarentena e resolveu 150 nomes históricos. A checagem preliminar de vínculo de gênero identificava 25 pendências; a checagem adicional de coerência do binômio reteve mais 11. Exemplos incluem nomes antigos associados a outro gênero e uma expressão com subgênero. Esses casos são revisáveis; não foram apagados nem renomeados automaticamente.

O conflito Saurornithoides é preservado como `pbdb-69227` e `pbdb-38573`, com autores e famílias distintos na fonte. A manutenção deverá investigar se existe erro, homonímia ou outro problema taxonômico antes de definir uma política curatorial.

## Próximos campos científicos

Ocorrências deverão conservar localidades modernas, contexto estratigráfico, intervalo temporal e referência. País de descoberta, distribuição conhecida e paleocoordenadas são conceitos distintos. Intervalos de ocorrência não comprovam automaticamente o surgimento ou a extinção reais de uma linhagem.

Estimativas de comprimento, altura e massa precisam de unidade, referência, método, espécime e incerteza quando disponíveis. Dados referentes a um espécime não devem ser apresentados silenciosamente como média de uma espécie ou de todo um gênero. Não completar lacunas com geração de texto ou números sem evidência.

Imagens precisam de licença e atribuição próprias. Uma licença do código ou de um conjunto de dados não cobre automaticamente as ilustrações de terceiros.

## Retificação

Correções devem identificar táxon, campo, fonte primária e motivo. A decisão fica registrada na revisão ou issue correspondente; mudanças curatorias sobrepostas à fonte deverão ter armazenamento próprio antes de serem oferecidas. O sincronizador atual reconstrói o catálogo: edições manuais em `data/catalog.json` seriam perdidas e invalidariam a reprodução por evidências.

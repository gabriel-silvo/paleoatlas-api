# Continuidade do PaleoAtlas API

Atualizado em 9 de novembro de 2026. Este documento registra o estado do trabalho para uma nova conversa; não pressupõe acesso ao histórico do chat.

## Localização e repositório

- Checkout de trabalho escolhido pelo proprietário no Windows: `D:\dev\Typescript\dino-api`.
- Repositório público: https://github.com/gabriel-silvo/paleoatlas-api.
- O projeto foi inicialmente criado por engano em `D:\dev\React\rpg-dino`, que era o diretório informado pelo ambiente da conversa derivada. Foi copiado com histórico Git para o checkout correto. A cópia antiga foi preservada; não é a pasta de trabalho da API.
- Copiar arquivos não altera a pasta vinculada à conversa. Uma nova conversa deve ser aberta explicitamente na pasta correta. Confirmar o diretório informado pelo ambiente antes de editar; usar o checkout correto se o chat ainda apontar para a pasta antiga, respeitando as permissões do ambiente.
- Não é necessário excluir conversas. Este documento e os demais arquivos de projeto são o mecanismo de continuidade independente do histórico.

## Decisões do proprietário

PaleoAtlas API é uma API científica própria, independente do futuro RPG React. Código público e consulta pública. Escopo: dinossauros não avianos, gêneros aceitos e espécies formalmente descritas; nomes históricos com destino seguro resolvem para o gênero aceito com aviso. Gênero e espécie permanecem distintos. Imagens ficam fora da próxima etapa, por instrução explícita do proprietário.

O proprietário quer mínimos e máximos de dimensões/massa por gênero, intervalo temporal em milhões de anos e lista de países de achados. O desenho recomendado está em [ENRICHMENT_PLAN.md](ENRICHMENT_PLAN.md): resumos por gênero derivados de afirmações rastreáveis em sua granularidade original. A proposta de enriquecimento ainda não foi implementada.

## O que existe

TypeScript, Fastify, OpenAPI em `/docs`, recursos em `/api/v1`, paginação, consultas por nome/ID, aliases e conflitos de nomes. Arquivo versionado funciona sem banco. PostgreSQL opcional armazena snapshots imutáveis e um ponteiro transacional; reiniciar a API após publicar uma versão.

Primeiro snapshot de 2026-11-09: 1.323 registros de gênero aceitos pela consulta à PBDB, correspondendo a 1.322 nomes distintos; 1.430 espécies consultáveis; 150 aliases; 36 espécies em quarentena. Trata-se de candidatos da classificação PBDB, não um censo universal auditado. Dois registros de Saurornithoides são preservados separadamente e a busca por nome retorna 409.

Todas as 1.430 espécies têm binômio, gênero, epíteto, ID e referência bibliográfica; 1.429 têm autoria e 885 têm família. Nenhuma tem medidas preenchidas. Ainda não há ocorrências, países, idades, dieta ou imagens no contrato publicado. Os registros são `imported_unreviewed`.

## Verificação já realizada

A implementação inicial passou por 16 testes, sem ignorados, em PostgreSQL 17.11 temporário, além de tipagem e compilação. A cópia no checkout correto teve dependências instaladas e compilação confirmada. A execução local usa porta 3000; verificar se o processo ainda existe antes de assumir que está ativo.

O workflow de CI e a coleta semanal foram configurados. Na primeira execução, o GitHub impediu a inicialização do runner por uma restrição da conta do proprietário. A execução remota não validou o projeto; os testes com banco foram feitos localmente. A manutenção não deve alterar cobrança nem alegar que a coleta semanal está executando enquanto houver bloqueio.

## Próximo trabalho

1. Ler AGENTS.md, CONTEXT.md, DATA_POLICY.md e ENRICHMENT_PLAN.md.
2. Implementar persistência de afirmações/enriquecimentos separada da reconstrução taxonômica: o sincronizador atual recria o catálogo e apagaria edições manuais.
3. Implementar ocorrências PBDB por lotes, associação a IDs elegíveis, referências, países e incerteza temporal.
4. Usar o catálogo legado como fila de revisão, não como evidência científica suficiente. Auditar fonte e unidade por campo antes de promover medidas.
5. Examinar suplementos científicos de massa e começar um lote piloto de 20 gêneros; documentar fontes, divergências e cobertura antes de expandir.

## Fonte legada localizada

A branch main de `gabriel-silvo/Sr_Raptor-2.0` lê um catálogo externo do projeto público `majordino-s-dinodex/dinodex`: 94 registros, última alteração do arquivo em 2024-11-01. A branch postgresql contém `Database/dinosaurs.json`: 93 registros, última alteração do arquivo em 2024-03-05. Ambos foram inspecionados; a suposição de mais de 100 registros não se confirmou nessas versões.

O catálogo público tem 89 correspondências diretas com o índice atual, uma relação histórica e quatro nomes não resolvidos. Não contém referências científicas por medida nem definição explícita de altura/unidades. Há também inconsistências estruturais a revisar. Ver [a auditoria](research/legacy-catalog-audit.md) e seu [relatório](research/legacy-catalog-audit.json). Nenhum número legado foi incorporado à API.

## Prompt para retomar em uma nova conversa

> Continue o PaleoAtlas API nesta pasta. Leia AGENTS.md, docs/HANDOFF.md e docs/ENRICHMENT_PLAN.md. Confirme o diretório atual e retome o enriquecimento com fontes, revisão por campo e sem imagens. O catálogo legado é uma fila de revisão; não publique seus valores automaticamente.

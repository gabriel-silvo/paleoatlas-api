# Auditoria inicial do catálogo legado

Consulta realizada em 2026-11-09. Esta auditoria verifica estrutura e correspondência de nomes; não revisa cientificamente as medidas e não altera a API.

## Localização

O repositório `gabriel-silvo/Sr_Raptor-2.0` foi consultado com a autenticação Git já existente. A branch main não contém o catálogo de dinossauros em JSON: `DinoRepository` obtém a URL `DINODEX_URL` de `Common/constants.py` e faz uma leitura HTTP do projeto público `majordino-s-dinodex/dinodex`. A branch postgresql contém uma cópia anterior em `Database/dinosaurs.json`.

| Conjunto | Registros | Último commit do arquivo | Correspondência direta | Alias | Sem resolução |
| --- | ---: | --- | ---: | ---: | ---: |
| dinodex público | 94 | 2024-11-01 | 89 | 1 | 4 |
| Sr_Raptor-2.0, branch postgresql | 93 | 2024-03-05 | 88 | 1 | 4 |

Não foram encontrados mais de 100 registros nessas duas versões. Lokiceratops aparece apenas na variante pública mais recente quanto à lista de gêneros. Essa comparação de nomes não estabelece que os demais valores sejam idênticos entre as versões.

Fonte pública fixada em commit: [dinosaurs.json](https://github.com/majordino-s-dinodex/dinodex/blob/a1d3a9afddfb2a8f84d4fbb2968ff0d520231e46/dinosaurs.json). A variante da branch postgresql foi lida no commit `c3c833959ebb267818bacf1f7c24631c0534d4b4`, blob `82f6d864471428a027ac46f7875d6bd64562ab5b`. O modelo de leitura na main foi examinado no commit `8371412862a28ac499c21252a1c8c1e799b0e5d4`.

## Correspondência com o snapshot local

O cruzamento usa `nome.genero`, não `nome.base`, porque o segundo pode ser um nome popular em português. O alvo é o snapshot PBDB de 2026-11-09 já publicado no PaleoAtlas.

Miragaia resolve como relação histórica para `pbdb-38808` segundo o snapshot atual, não como decisão curatorial independente. Os quatro nomes não resolvidos são Lexovisaurus, Mosasaurus, Quetzalcoatlus e Ubirajara. Eles exigem análise individual: ausência de correspondência pode refletir escopo, classificação, tratamento nomenclatural ou outra diferença. Não concluir que todo nome ausente é inválido. Mosasaurus e Quetzalcoatlus também precisam respeitar a exclusão de outros grupos pré-históricos definida pelo proprietário.

## Campos encontrados

Nome científico, nome popular, epítetos de espécies, significado do nome, dieta, família, URLs/créditos de imagens, dimensões mínimas/máximas, massa mínima/máxima, limites temporais, localização textual e alguns atributos adicionais. Parte do mesmo conjunto é usada pelo bot para sorteio de características individuais e regras de jogo. Importar o JSON não valida a interpretação científica desses limites.

No catálogo público:

- Nenhum dos 94 registros possui campos de referências científicas por medida.
- Os registros não declaram explicitamente unidades nem definição de altura.
- 41 registros têm limites de altura iguais, 35 de massa iguais e 29 de comprimento iguais; igualdade não comprova ausência de incerteza ou variação.
- Dois registros têm limites temporais inconsistentes com a ordenação numérica esperada.
- Um registro tem limites de comprimento ausentes ou não numéricos.
- Há nomes que exigem resolução de escopo e taxonomia antes de associar qualquer valor.

O relatório [legacy-catalog-audit.json](legacy-catalog-audit.json) contém a fila por nome, os problemas estruturais e hashes dos arquivos auditados. Ele omite os valores científicos antigos para não apresentá-los como dados aprovados. Nenhuma imagem foi baixada e nenhum valor foi adicionado ao catálogo servido.

## Uso recomendado

Usar os nomes e afirmações antigas como roteiro para pesquisa bibliográfica. Revisar primeiro uma seleção de 20 gêneros com correspondência segura. Identificar fontes originais, atualidade, unidades, altura do quadril/cabeça e relação com espécies/espécimes antes de publicar os números. Referências ausentes precisam ser pesquisadas; uma revisão não consiste apenas em mudar a data do registro.

O serviço GitHub não detectou licença no repositório público do dinodex. A autorização do proprietário para aproveitar seu catálogo permite preparar este trabalho; a procedência e as condições de reutilização das afirmações e de eventuais contribuições externas ainda devem ser registradas. Não aplicar automaticamente a licença CC BY da PBDB ao legado. O modelo científico deverá conservar licenças por fonte.

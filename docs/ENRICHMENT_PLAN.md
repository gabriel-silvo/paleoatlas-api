# Próxima carga: medidas, países e idade

Desenho proposto em 2026-11-09. Este documento não altera a API nem declara valores novos como revisados.

## Resumos por gênero

A consulta por gênero deve oferecer mínimos e máximos de comprimento, massa e alturas quando houver evidência elegível, além de países de achados e um envelope temporal de ocorrências. Esses campos são resumos convenientes, não substitutos das afirmações originais.

Cada observação preserva gênero, espécie ou espécime a que a fonte realmente se refere. Não atribuir a uma espécie uma estimativa publicada apenas para o gênero. Conservar referência, método, unidade, data da publicação, estágio de vida, condição de revisão e natureza do intervalo. Estimativas sem vínculo seguro ficam em revisão.

## Medidas e significado dos extremos

Três situações diferentes precisam de representação explícita:

- Variação entre espécies ou espécimes do mesmo gênero.
- Incerteza de uma estimativa para um mesmo animal ou táxon.
- Discordância entre métodos ou publicações.

Uma faixa agregada não é automaticamente intervalo de confiança nem mínimo/máximo de todos os animais que existiram. O mínimo de um juvenil e o máximo de um adulto não devem compor silenciosamente um resumo de tamanho adulto. Extremos de estudos superados devem ser retidos no histórico e excluídos do resumo elegível por decisão registrada.

| Campo conceitual | Convenção |
| --- | --- |
| Comprimento total | Metros; distinguir de comprimento de osso ou cauda |
| Altura do quadril | Metros, categoria própria |
| Altura da cabeça | Metros, com postura/contexto quando necessário |
| Altura sem definição | Preservar como afirmação pendente; não combinar com as anteriores |
| Massa corporal | Quilogramas; o termo popular peso se refere aqui a massa |
| Estimativa pontual | Valor com incerteza desconhecida, sem inventar extremos |
| Intervalo | Limites, natureza e método documentados |

O resumo deve incluir espécies/observações cobertas, total de espécies no catálogo, referências de suporte e data da revisão. Não sugerir que um resumo baseado em uma espécie cobre todas as espécies do gênero. Um campo pode permanecer desconhecido mesmo quando os demais estão preenchidos.

## Países e idade

Importar ocorrências PBDB com IDs, gênero aceito, país/território moderno, contexto temporal e referências. Associar por identificador, não pelo texto do nome. Conservar registros brutos e separar os que não puderem ser vinculados ao catálogo.

A lista de países/territórios é a união das localidades modernas dos achados elegíveis. Ela não equivale a todo o território historicamente habitado. Conservar códigos e nomes localizados; tratar casos como Antártida sem exigir que todo código represente um país soberano. País desconhecido não deve ser adivinhado a partir do continente.

Usar `oldest_ma` e `youngest_ma` para o envelope, com `oldest_ma >= youngest_ma >= 0`. Ma significa milhões de anos antes do presente: números maiores são mais antigos. Preservar também a incerteza das primeiras e últimas aparições e suas ocorrências de suporte. Uma ocorrência datada em uma faixa ampla não comprova presença durante toda a faixa, nem estabelece surgimento/extinção exatos da linhagem.

Consulta amostral conferida:

```text
https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria%5EAves%5EAvialae&pres=regular&show=classext,loc,time,ages,ref&vocab=pbdb&limit=2
```

Ela retorna `genus_no`, `cc`, `max_ma`, `min_ma` e referências, entre outros campos. A carga integral deve usar páginas/blocos com limites explícitos, detectar truncamento, conservar cada lote e revisar divergências. A amostra não valida a cobertura completa. O bloco `show=size` de táxons da PBDB conta subtáxons; não fornece dimensões corporais.

## Sequência de trabalho

1. **Separar afirmações da taxonomia.** Criar armazenamento próprio de evidências e decisões curatoriais; compor o catálogo publicado a partir de versões identificadas desses insumos. Preservar a reconstrução verificável. Editar diretamente `data/catalog.json` seria perdido na próxima sincronização.
2. **Países e tempo.** Importar ocorrências PBDB por lotes, resolver IDs, deduplicar ocorrências e produzir resumos com referências e cobertura. Revisar limites temporais amplos e atribuições duvidosas.
3. **Auditoria legada.** Usar os 94 registros do dinodex como candidatos à pesquisa. Comparar a variante de 93 registros sem somar cópias como táxons adicionais. Reter cada afirmação antiga como não revisada até encontrar fonte adequada.
4. **Massas em conjuntos científicos.** Examinar os suplementos de Benson 2014 e Dryad 2018, metadados, unidades e métodos; cruzar táxons com o catálogo e excluir aves. Verificar revisões posteriores antes de selecionar estimativas para o resumo atual.
5. **Lote piloto.** Revisar 20 gêneros escolhidos entre correspondências seguras do legado. Para cada campo, registrar referência primária, atualidade, espécie/espécime, unidade e natureza do intervalo. Altura pode continuar ausente se a fonte não a definir.
6. **Publicação revisada.** Gerar rascunho, diferenças por campo, pendências, cobertura e referências. Executar validações e testes de preservação/reprodução antes de publicar. Expandir para outros lotes conforme a qualidade obtida; não prometer completar todos os campos de todos os gêneros.

## Critérios para promover um valor

- Identidade e elegibilidade taxonômica resolvidas, sem confundir nome popular e científico.
- Fonte e licença de reutilização identificadas; referências por afirmação, não apenas uma bibliografia genérica no gênero.
- Unidade, definição de dimensão e granularidade explícitas.
- Limites não negativos e ordenados; valores pontuais e intervalos tratados de modo diferente.
- Divergências, valores superados e restrições de vida/espécime examinados.
- Resumo de gênero reproduzível somente a partir de observações elegíveis, com cobertura e suportes.
- Atualização taxonômica posterior preserva as evidências curatoriais e sinaliza táxons removidos/renomeados para nova resolução.

## Imagens

O proprietário adiou imagens. Esta etapa não baixa, armazena ou publica imagens, mesmo quando o catálogo legado contém URLs e créditos. A auditoria textual do JSON não constitui importação desses arquivos.

## Fontes e limites

[Pesquisa de enriquecimento](research/bulk-enrichment-sources.md) reúne o código oficial da PBDB, as consultas realmente verificadas e os datasets candidatos. [Benson 2014](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001853) apresenta massas para 441 táxons, incluindo aves; [Dryad 2018](https://datadryad.org/dataset/doi:10.5061/dryad.1t3r4) disponibiliza medidas, metadados e massas. Esses conjuntos não oferecem, por si só, todas as alturas, comprimentos e massas atuais de todos os gêneros. Seus suplementos ainda precisam ser inspecionados antes de construir importadores.

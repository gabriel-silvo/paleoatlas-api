# Pesquisa para enriquecimento em lote

Consultas verificadas em 9 de novembro de 2026. Este documento recomenda um desenho; nenhum novo dado foi publicado no catálogo.

## PBDB: ocorrências, países e idade

O [código oficial de OccurrenceData](https://github.com/paleobiodb/data_service/blob/master/lib/PB2/OccurrenceData.pm) documenta `classext` (classificação e IDs), `loc`, `time`, `ages` e `ref`. `vocab=pbdb` oferece nomes extensos de campos. Uma amostra de duas ocorrências foi efetivamente consultada, sem avisos:

```text
https://paleobiodb.org/data1.2/occs/list.json?base_name=Dinosauria%5EAves%5EAvialae&pres=regular&show=classext,loc,time,ages,ref&vocab=pbdb&limit=2
```

Campos confirmados na resposta: `occurrence_no`, `collection_no`, `identified_name`, `accepted_no`, `accepted_name`, `genus_no`, `genus`, `cc`, `max_ma`, `min_ma`, `reference_no` e `primary_reference`. No vocabulário compacto, os equivalentes incluem `oid`, `cid`, `tid`, `gnn`, `eag`, `lag` e `rid`.

Para uma carga futura, usar a mesma seleção em páginas ou blocos de IDs elegíveis, conservando cada ocorrência e sua referência; só agregar após resolver `genus_no` para o índice local. A amostra não prova completude nem valida uma carga integral. Não confundir parâmetros de filtros com campos de saída.

O [código oficial de CollectionData](https://github.com/paleobiodb/data_service/blob/master/lib/PB2/CollectionData.pm) especifica `cc` como filtro de códigos de países/continentes; a resposta amostrada contém `cc=CN`. Conservar códigos e apresentar nomes localizados em camada própria. Uma lista de países representa locais modernos onde foram registrados fósseis, não território completo habitado pelo gênero. `ages` permite conservar datação direta, limites, unidade, método e erro quando preenchidos. Unidades de medidas de idade direta podem ser Ma, Ka ou YBP: normalizar explicitamente.

## Intervalos temporais não são duração exata da linhagem

O [código oficial de TaxonData](https://github.com/paleobiodb/data_service/blob/master/lib/PB2/TaxonData.pm) define `show=app` como primeiras e últimas aparições baseadas nas ocorrências registradas. O bloco `size` conta subtáxons: não significa tamanho corporal.

Consulta pequena executada:

```text
https://paleobiodb.org/data1.2/taxa/single.json?id=38613&show=app&vocab=pbdb
```

Tyrannosaurus retornou `firstapp_max_ma=83.6`, `firstapp_min_ma=72.2`, `lastapp_max_ma=72.2`, `lastapp_min_ma=66`, com intervalos Campanian/Maastrichtian. São limites da classificação/datação da fonte, e não demonstração de que Tyrannosaurus viveu exatamente entre 83,6 e 66 Ma. Preservar quatro limites ou um envelope explicitamente rotulado, além das ocorrências de suporte. Datar uma ocorrência amplamente também não prova presença durante todo o seu intervalo.

## Medidas e massa: fontes científicas em lote

[Benson et al. 2014, PLOS Biology](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001853) oferece Dataset S1 com estimativas de massa para 441 táxons, usando relação de robustez dos membros. Inclui aves; precisa cruzar com IDs elegíveis. Os métodos informam exclusão de juvenis nas análises. A página declara CC0. É uma base histórica de estimativas, não a última palavra por espécie e não um catálogo de altura/comprimento corporal para todos os gêneros.

[Benson et al., Dryad 2018](https://datadryad.org/dataset/doi:10.5061/dryad.1t3r4) disponibiliza Dataset S1.zip, descrito como medidas, metadados e estimativas de massa de Dinosauria, e Appendix S1 com os métodos. [Termos do Dryad](https://datadryad.org/terms) estabelecem publicação de datasets sob CC0 e incentivam citação. Não foi aberto o workbook nesta pesquisa: cobertura e nomes de colunas precisam de inspeção antes da importação. Não interpretar comprimento de fêmur como comprimento total nem circunferência como massa.

## Recomendação de modelagem (decisão de engenharia proposta)

- Conservar cada estimativa em sua granularidade original: gênero, espécie ou espécime; fonte, método, data da publicação, intervalo e natureza do intervalo, estágio de vida e definição de altura.
- Usar `mass_kg` para a grandeza popularmente chamada peso; comprimento e alturas em metros, distinguindo quadril de cabeça.
- Oferecer no gênero um resumo derivado apenas das observações elegíveis e revisadas, com quantidade de observações e espécies cobertas, IDs de suporte e data de revisão.
- Distinguir variação entre espécies/espécimes de incerteza de estimativa e divergência entre estudos. Um envelope combinado não é automaticamente intervalo de confiança.
- Um único valor estimado pode ser registrado como estimativa pontual, com incerteza desconhecida; não declarar artificialmente dois extremos iguais como variação zero.
- Países e envelope temporal são resumos de ocorrências; conservar referências, conflitos e registros suspeitos para revisão.
- Começar com ocorrências/paises/idade, depois datasets de massa e revisão em lotes de 20–50 gêneros; medidas de altura e comprimento provavelmente exigirão curadoria bibliográfica adicional.
- Sem imagens nesta etapa, conforme instrução do proprietário.

## Limites da verificação

Foram conferidos o código oficial da PBDB e duas consultas pequenas, a descrição dos datasets e suas licenças declaradas. Não foi feita coleta completa de ocorrências, auditoria científica de cada gênero, download dos suplementos de medidas ou comparação entre todas as publicações posteriores. Portanto, nenhuma promessa de preenchimento de todos os campos para todos os gêneros se sustenta nesta pesquisa.

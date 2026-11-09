# Fontes para uma API de dinossauros

Pesquisa em 9 de novembro de 2026. Nenhuma fonte abaixo foi auditada registro a registro; números anunciados pelos projetos não demonstram completude científica.

## Fontes e limites

- **Paleobiology Database (PBDB)**: o artigo dos próprios responsáveis descreve ocorrências fósseis identificadas taxonomicamente, com posição geográfica e temporal, referências, autoridades e opiniões taxonômicas. A classificação é calculada a partir dessas opiniões e pode mudar. Os registros públicos estão sob CC BY 4.0. É uma boa base para taxonomia, ocorrências e bibliografia, mas não uma garantia de fichas completas de altura, comprimento e massa para cada espécie. Fonte: [Peters e McClennen, API da PBDB](https://doi.org/10.1017/PAB.2015.39). A documentação direta em paleobiodb.org retornou 403 durante esta consulta; não foram testados endpoints.
- **RESTasaurus**: anuncia quase 1.200 dinossauros, obtidos da Wikipedia; o README explicita que os dados podem ter mudado desde a coleta. Inclui classificação e imagens e declara limite de 20 requisições por hora. É uma API pronta interessante, sem evidência de abranger todos os gêneros e espécies com todos os atributos desejados. Textos da Wikipedia são declarados CC BY-SA 4.0; imagens exigem conferência por obra. Fonte: [repositório oficial](https://github.com/vikiru/restasaurus).
- **DinoAPI de darkmoonsk**: oferece campos como massa, altura, comprimento, dieta, período, região e imagem; declara usar PaleoDB e outras fontes. O exemplo é organizado por nome de gênero, com valores textuais e descrição, sem demonstrar proveniência por atributo, intervalos de incerteza ou cobertura exaustiva por espécie. A licença MIT do código não deve ser presumida licença universal dos dados e das imagens. Fonte: [repositório oficial](https://github.com/darkmoonsk/dinoapi).
- **Dino API de sopynya**: apresenta-se como projeto pequeno de entusiasta; cita expansão de morfologia e referências como melhorias futuras. Fonte: [repositório oficial](https://github.com/sopynya/dinoapi).
- **Benson et al. (2014)**: artigo científico com conjunto de estimativas de massa para 441 táxons, usando relações de robustez de ossos dos membros; o Dataset S1 contém as estimativas. Mostra que medidas devem registrar método, amostra e incerteza, além do valor. Não cobre toda a diversidade nomeada. Fonte: [PLOS Biology, artigo e suplementos](https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1001853).
- **Benson et al., conjunto de 2018 no Dryad**: dados suplementares sobre evolução de tamanho corporal, úteis como complemento especializado; não são uma API enciclopédica nem um fluxo automático de descobertas. Fonte: [Dryad](https://datadryad.org/dataset/doi%3A10.5061/dryad.1t3r4).

## Recomendações derivadas da pesquisa

1. Definir cobertura: dinossauros não avianos; nomes aceitos versus todos os nomes históricos; gêneros versus espécies; tratamento de nomes duvidosos e sinônimos.
2. Importar dados com identificador da fonte e manter os registros originais. Não usar somente o nome como chave estável.
3. Separar táxons, ocorrências fósseis, referências e estimativas de medidas. Guardar unidades, método, exemplar quando conhecido, intervalos e data de revisão.
4. Admitir campos desconhecidos; não preencher lacunas com números inventados ou estimativas sem identificação.
5. Atualizar por tarefas periódicas e revisão de diferenças; sincronização com uma fonte não equivale a cobertura instantânea de toda a literatura.
6. Separar dados científicos de cartas, atributos, progressão e balanceamento do RPG.
7. Registrar autor, licença, origem e atribuição das imagens individualmente.

Essas recomendações são decisões de engenharia propostas a partir dos limites observados, não garantias oferecidas pelas fontes.

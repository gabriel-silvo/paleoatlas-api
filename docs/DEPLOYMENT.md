# Operação e hospedagem

## Desenvolvimento

Use Node.js 24 ou superior. `npm ci` instala exatamente o lockfile. `npm run dev` carrega `.env` se existir e inicia com observação de alterações. O padrão é `127.0.0.1:3000`, com o snapshot versionado. A documentação está em `/docs` e o OpenAPI em `/docs/json`.

## Configuração

| Variável | Padrão | Uso |
| --- | --- | --- |
| HOST | 127.0.0.1 | Endereço de escuta; em contêiner ou serviço gerenciado usar 0.0.0.0 |
| PORT | 3000 | Porta HTTP |
| LOG_LEVEL | info | Nível dos logs Fastify |
| CATALOG_PATH | data/catalog.json | Snapshot em disco |
| DATABASE_URL | ausente | Se presente, ler o catálogo publicado no PostgreSQL |
| CORS_ORIGIN | * | Origens permitidas, separadas por vírgula, ou leitura pública com * |

Nunca colocar credenciais reais no repositório. CORS controla o comportamento do navegador, não é autenticação nem protege uma API privada.

## PostgreSQL local

Requer Docker com Compose instalado:

```sh
docker compose up -d
```

Copie `.env.example` para `.env` e habilite a URL PostgreSQL de desenvolvimento. Depois:

```sh
npm run db:migrate
npm run db:load
npm run check
npm run dev
```

O teste PostgreSQL roda quando `DATABASE_URL` está definido. Sem essa variável, é explicitamente ignorado. A CI prepara um PostgreSQL 17 real, carrega o snapshot e executa esse teste. As credenciais de Compose são exclusivamente locais e a porta é ligada ao loopback.

## Publicar o processo HTTP

Exemplo em serviço Node gerenciado, como Render:

1. Conectar o repositório e selecionar Node.js 24.
2. Build: `npm ci && npm run build`.
3. Inicialização: `npm start`.
4. Definir `HOST=0.0.0.0`; usar a porta oferecida pelo provedor via `PORT`.
5. Health check: `/health`.
6. Para a primeira hospedagem, usar o snapshot incluído. PostgreSQL é opcional.
7. Se optar por PostgreSQL gerenciado, definir `DATABASE_URL`, aplicar migração e carga em uma tarefa de manutenção antes de iniciar o serviço. Seguir a exigência de TLS do provedor; não desabilitar validação de certificados para contornar configuração.

Referência: [Render — primeiro deploy](https://render.com/docs/your-first-deploy). Este repositório não provisiona conta, domínio nem serviço pago automaticamente.

## Docker

```sh
docker build -t paleoatlas-api .
docker run --rm -p 3000:3000 paleoatlas-api
```

A imagem executa como usuário sem privilégios e inclui o snapshot da versão compilada. Não publicar o banco de desenvolvimento na internet. Credenciais de produção devem ser injetadas pelo provedor.

## Atualizações e recuperação

Arquivo: revisar/promover/arquivar uma nova carga, validar, fazer commit e implantar nova versão. Para voltar, reimplantar um commit anterior com seu catálogo e evidências correspondentes.

PostgreSQL: `db:load` insere um snapshot por hash e troca o ponteiro atual em uma transação; snapshots anteriores permanecem no banco. Para recuperar, carregar o snapshot validado de um commit anterior e reiniciar o processo. Fazer backup do PostgreSQL conforme a política do provedor e testar a restauração. Os arquivos versionados também permitem reconstruir o catálogo de consulta.

Monitorar `/health`, erros HTTP, limites de requisição e falhas das coletas. A saúde atual indica que o processo carregou um snapshot válido, não que a PBDB está disponível ou que a literatura foi revisada recentemente. Uma atualização não muda a cópia em memória de processos já iniciados.

## Visibilidade e permissões

O repositório público permite ler código e dados licenciados. A API pública permite consumir as consultas HTTP. Ambos são independentes. Nesta versão não há endpoints administrativos: atualização é feita por manutenção com acesso ao repositório e à infraestrutura. Futuras camadas privadas precisam de autenticação e autorização no servidor; uma chave embutida num frontend React é pública para seus usuários.

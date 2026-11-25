# ServeRest: testes de API com Playwright e Postman/Newman

![Testes de API](https://github.com/jr-silva-dev/qa-api-serverest/actions/workflows/api-tests.yml/badge.svg)

Testes automatizados da API [ServeRest](https://serverest.dev), uma API brasileira de treino com Swagger (usuários, login, produtos e carrinhos). O mesmo domínio é coberto de duas formas:

1. **Playwright (`request`) com TypeScript:** 17 testes organizados por recurso.
2. **Coleção Postman executada pelo Newman:** um fluxo de 12 requisições em sequência, com 20 asserções.

## O que é testado

| Recurso | Cenários |
|---|---|
| Usuários | cadastro válido; e-mail repetido (400); e-mail inválido (400); campos obrigatórios (400); busca por id (200); id inexistente (400) |
| Login | credenciais válidas e token Bearer; senha incorreta (401); e-mail não cadastrado (401) |
| Produtos | sem token (401); usuário não administrador (403); cadastro e consulta por administrador; nome repetido (400); exclusão |
| Carrinhos | sem token (401); criar carrinho e concluir compra; quantidade acima do estoque (400) |

Cada teste cobre o caminho feliz e os caminhos de erro (status HTTP e mensagem retornada), que é onde os bugs de API costumam aparecer.

## Estrutura

```
tests/      testes Playwright por recurso (usuarios, login, produtos, carrinhos)
support/    funções de apoio: criar usuário, fazer login, criar produto, limpar dados
postman/    coleção Postman com scripts de teste
.github/    pipeline com os dois jobs (Playwright e Newman)
```

Decisões de projeto:

- **Dados únicos:** e-mails e nomes de produto incluem data e número aleatório, então os testes não colidem entre si nem entre execuções.
- **Independência:** cada teste cria o que precisa e remove ao final, sem depender da ordem de execução.
- **Preparação com verificação:** as funções de apoio já conferem o status da preparação, então uma falha de setup aparece com mensagem clara.

## Como rodar

```bash
npm install

npm test                 # testes Playwright
npm run report           # relatório HTML do Playwright

npm run test:newman      # coleção Postman via Newman (relatório em newman-report/)
```

Para apontar para outra instância (por exemplo, o ServeRest rodando local):

```bash
BASE_URL=http://localhost:3000 npm test
npx newman run postman/serverest.postman_collection.json --env-var baseUrl=http://localhost:3000
```

Você também pode importar `postman/serverest.postman_collection.json` direto no Postman.

## Limitações

- O ServeRest público é compartilhado e pode ser reiniciado ou ficar lento. O pipeline usa `retries` para absorver instabilidade.
- As mensagens esperadas (por exemplo, `Este email já está sendo usado`) seguem a documentação e o comportamento do ServeRest. Se a API mudar um texto, o teste correspondente falha e o ajuste é simples.

## Tecnologias

Playwright, TypeScript, Postman, Newman, GitHub Actions.

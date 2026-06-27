# Coleção de Scripts TypeScript

Uma coleção pessoal de scripts criados para explorar TypeScript, Bun e o ecossistema JavaScript/TypeScript.

O projeto contém pequenos componentes independentes, focados em uso prático, experimentação e melhoria progressiva.

## Componentes

### `github-searcher`

Um pequeno gateway para consumir a API do GitHub e buscar usuários, repositórios e commits.

Principais recursos:

- Buscar um usuário do GitHub pelo username
- Buscar um repositório por dono e nome
- Listar commits de um repositório
- Filtrar commits por committer
- Usar uma função `fetch` customizada para testes

### `text-transformer`

Uma CLI simples para transformação de texto.

Principais recursos:

- Ler texto de um arquivo de entrada
- Aplicar ações de transformação
- Escrever o resultado em um arquivo de saída
- Suportar ações como uppercase, lowercase, replace e includes

## Estrutura do Projeto

```txt
.
├── docs
│   ├── README.md
│   └── README.pt-BR.md
├── github-searcher
│   ├── index.spec.ts
│   ├── index.ts
│   └── README.md
└── text-transformer
    ├── src
    ├── index.ts
    └── README.md
```

## Requisitos

* Bun
* TypeScript

## Execução

Cada componente possui seu próprio README com exemplos de uso específicos.

Exemplo:

```bash
cd text-transformer
bun index.ts -i input.txt -o output.txt uppercase
```

## Testes

Alguns componentes possuem testes usando o test runner do Bun.

```bash
bun test
```

## Observações

Este repositório é organizado como uma coleção de scripts independentes. Cada módulo pode evoluir separadamente e possuir sua própria API, CLI, testes e documentação.

# LICENÇA

Veja mais em [LICENSE](../LICENSE)

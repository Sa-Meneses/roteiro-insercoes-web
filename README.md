# roteiro-insercoes-web

Skill para pesquisar e coletar inserções visuais a partir de um roteiro. Ela orienta o agente a buscar fontes públicas/oficiais, gravar páginas públicas com scroll, salvar imagens/vídeos permitidos e gerar um manifesto de fontes.

## Instalação via npx

Depois que este repositório estiver público em `Sa-Meneses/roteiro-insercoes-web`, instale com:

```bash
npx github:Sa-Meneses/roteiro-insercoes-web --agent codex
```

Se a skill já existir localmente, atualize/substitua com:

```bash
npx github:Sa-Meneses/roteiro-insercoes-web --agent codex --force
```

Outros alvos:

```bash
npx github:Sa-Meneses/roteiro-insercoes-web --agent claude
npx github:Sa-Meneses/roteiro-insercoes-web --agent gemini
npx github:Sa-Meneses/roteiro-insercoes-web --agent all
```

Se o `npx` falhar com erro de cache do npm, use um cache temporário:

```bash
npm_config_cache=/tmp/npm-cache-roteiro-insercoes npx -y github:Sa-Meneses/roteiro-insercoes-web --agent codex --force
```

Instalação em pasta customizada:

```bash
npx github:Sa-Meneses/roteiro-insercoes-web --target ~/.codex/skills/roteiro-insercoes-web --force
```

## Uso

```text
Use $roteiro-insercoes-web no formato mobile. Aqui está meu roteiro: ...
```

```text
Use $roteiro-insercoes-web no formato horizontal 16:9. Quero uma inserção para cada 5 palavras.
```

## O que a skill faz

- segmenta roteiro em blocos de cerca de 5 palavras;
- pesquisa inserções visuais para cada bloco;
- prioriza fontes oficiais, primárias e públicas;
- captura páginas públicas full-page;
- cria gravações de tela com scroll em 9:16 ou 16:9;
- salva assets e manifesto de fontes em uma pasta local.

## Política de uso

Esta skill não deve burlar login, paywall, DRM ou restrições de download. Material público na internet não significa automaticamente livre para reutilização; registre sempre a fonte e a licença/permissão no manifesto.

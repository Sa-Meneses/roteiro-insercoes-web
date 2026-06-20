---
name: roteiro-insercoes-web
description: Pesquisa e coleta inserções visuais para edição de vídeo a partir de um roteiro. Use quando o usuário enviar um roteiro e pedir imagens, vídeos públicos, B-roll, gravações de tela, fontes oficiais, inserções para alta retenção, pacote de assets, ou gravação automática de páginas em mobile vertical ou 16:9 horizontal. A skill segmenta o roteiro em trechos curtos, busca uma inserção para aproximadamente cada 5 palavras, baixa materiais permitidos, grava telas públicas quando útil, salva tudo em pasta local com manifesto de fontes e entrega arquivos prontos para edição.
---

# Roteiro Inserções Web

## Objetivo

Criar um pacote de inserções para edição a partir de um roteiro: imagens, vídeos baixáveis quando permitido e gravações de tela de páginas públicas. Priorizar fontes oficiais, páginas originais e materiais com autorização clara de uso. Nunca criar vídeos sintéticos; quando precisar de movimento, gravar a tela da fonte pública.

## Fluxo

1. Receber o roteiro e o formato pedido:
   - `mobile`: 1080x1920, 9:16.
   - `horizontal`: 1920x1080, 16:9.
   - Se o usuário não escolher, usar `mobile`.
2. Criar uma pasta de saída em `outputs/<slug-do-tema>-insercoes/` no workspace atual.
3. Quebrar o roteiro em segmentos de aproximadamente 5 palavras com `scripts/segment_script.py`.
4. Para cada segmento, pesquisar uma inserção visual relevante:
   - Usar web search para fatos, páginas oficiais, GitHub, docs, páginas de produto, comunicados, notícias, imagens e vídeos.
   - Preferir fonte oficial ou primária. Se não existir, usar fonte pública confiável e registrar isso no manifesto.
   - Para dados atuais, confirmar a fonte no dia da execução.
5. Para cada inserção escolhida, decidir o tipo de asset:
   - `screen_recording`: página web, GitHub, docs, produto, post, tabela, dashboard, artigo.
   - `image`: imagem pública baixável com licença/permissão aceitável.
   - `video`: vídeo público baixável ou arquivo de mídia direto quando houver permissão clara.
6. Gravar tela para páginas que não tenham vídeo direto:
   - Usar `scripts/record_scroll_from_fullpage.py` para transformar captura full-page em rolagem limpa.
   - Se for passo a passo, gravar uma sequência de telas com pausas, zoom in/out e scroll suave; use browser/Chrome/Playwright quando disponível.
7. Salvar tudo com nomes numerados:
   - `assets/videos/001-<slug>.mp4`
   - `assets/images/001-<slug>.png`
   - `assets/raw/`
   - `sources/`
8. Criar `manifest.csv` e `manifest.md` com:
   - número do segmento;
   - trecho do roteiro;
   - query usada;
   - URL de origem;
   - tipo de fonte;
   - licença/permissão observada;
   - arquivo salvo;
   - observações de uso.
9. Entregar links para a pasta e para os principais MP4/PNG.

## Pesquisa e Seleção

Para cada bloco de 5 palavras, gerar uma intenção visual, não uma busca literal. Exemplo:

- Roteiro: "dando permissão para alguém ler seus arquivos"
- Intenção visual: tela de permissões, repositório com comandos, documentação de sandbox/permissões, terminal com leitura de arquivos.
- Busca: `official agent skill permissions file access`, `GitHub AI agent skills security`, ou a entidade citada no roteiro.

Use uma inserção por segmento sempre que fizer sentido. Se dois segmentos consecutivos forem a mesma ideia, pode usar um único asset mais longo e registrar no manifesto que cobre múltiplos segmentos.

## Gravação de Tela

Use gravação de tela quando:

- o usuário pedir para "mostrar o GitHub", "mostrar a página", "gravar a tela", "scrollando";
- a fonte visual principal for uma página oficial;
- baixar vídeo/imagem não for permitido ou não for a melhor prova visual.

Regras:

- Começar com 1 a 3 segundos parado no topo, mostrando nome da fonte/entidade.
- Rolar de forma suave e legível.
- Para passo a passo, pausar em cada etapa e aplicar zoom leve quando o detalhe for pequeno.
- Não adicionar cards, legendas ou overlays quando o usuário pedir gravação limpa.
- Não gravar conteúdo atrás de login, paywall, DRM ou que exija burlar restrição.

## Scripts

### Segmentar roteiro

```bash
python3 <skill>/scripts/segment_script.py roteiro.txt --words 5 --out outputs/<slug>/segments.csv
```

O script também aceita texto direto:

```bash
python3 <skill>/scripts/segment_script.py --text "cole o roteiro aqui" --words 5 --out outputs/<slug>/segments.csv
```

### Gerar vídeo de scroll a partir de captura full-page

```bash
python3 <skill>/scripts/record_scroll_from_fullpage.py \
  --input assets/raw/page-full.png \
  --output assets/videos/001-page-scroll.mp4 \
  --format mobile \
  --duration 30
```

Use `--format horizontal` para 1920x1080. Use `--start-hold`, `--end-hold`, `--fps` e `--zoom` quando necessário.

### Capturar uma página pública inteira no Chrome

```bash
node <skill>/scripts/capture_fullpage_chrome.mjs \
  --url "https://github.com/NVIDIA/SkillSpector" \
  --out assets/raw/001-github-fullpage.png \
  --width 1280 \
  --height 1920
```

Se o ambiente bloquear acesso ao Chrome local ou DevTools (`EPERM 127.0.0.1`), repetir com permissão escalada. Depois converter a captura em MP4 com `record_scroll_from_fullpage.py`.

## Política de Fontes

Leia `references/source_policy.md` quando for baixar imagens/vídeos de terceiros ou quando houver dúvida sobre uso/licença.

Resumo obrigatório:

- Preferir fontes oficiais, primárias, domínio público, Creative Commons ou mídia com licença explícita.
- Para YouTube/TikTok/Instagram e plataformas similares, não baixar vídeos de terceiros sem permissão/licença clara; preferir gravação de página oficial somente se for permitido e estritamente como evidência/insert curto, ou usar links/fonte oficial.
- Sempre registrar URL e licença/permissão no manifesto.
- Não prometer que "público na internet" significa livre para reutilização.

## Entrega

No final, responder em português com:

- pasta de saída;
- lista curta dos assets principais;
- observação sobre itens não encontrados ou não baixados por restrição de fonte/licença;
- fontes usadas.

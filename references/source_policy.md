# Política de fontes para inserções web

Use esta referência quando coletar imagens, vídeos e gravações de tela para edição.

## Ordem de preferência

1. Fonte oficial da entidade citada no roteiro: site institucional, GitHub oficial, docs oficiais, newsroom, blog oficial, página de produto.
2. Fonte primária pública: paper, repositório original, órgão governamental, base de dados pública.
3. Biblioteca com licença explícita: Wikimedia Commons, Pexels, Pixabay, Unsplash, Internet Archive, NASA, domínio público, Creative Commons.
4. Mídia jornalística ou social pública: usar apenas com cautela, como referência visual curta, e registrar a fonte.

## Não fazer

- Não burlar login, paywall, DRM, bloqueio regional, marca d'água ou proteção anti-download.
- Não baixar vídeo completo de plataformas sociais ou streaming quando a licença/permissão não estiver clara.
- Não remover marca d'água.
- Não apresentar material apenas "público na internet" como livre de direitos.

## Manifesto

Cada asset precisa registrar:

- `segment_id`
- `script_excerpt`
- `asset_type`
- `source_url`
- `source_owner`
- `license_or_permission`
- `download_or_capture_method`
- `local_file`
- `usage_notes`

Use `license_or_permission` como:

- `official-source-screen-recording`
- `public-domain`
- `creative-commons`
- `royalty-free-with-terms`
- `direct-download-permitted`
- `unknown-use-caution`

Se a licença for desconhecida, não baixar vídeo de terceiros. Preferir screenshot/recording curto da página oficial ou procurar outra fonte.

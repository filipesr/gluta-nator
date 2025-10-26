# 🍕 Gluta-nator 🍣

Contador de pedaços no rodízio - Transforme suas competições de pizza/sushi em algo épico!

## Funcionalidades

- ✨ Criar eventos de competição
- 👥 Múltiplos participantes por evento
- 📊 Ranking em tempo real
- 📱 Design responsivo para mobile
- 🔗 Compartilhamento fácil via link
- 💾 Dados salvos em banco de dados compartilhado (Vercel KV)

## Como usar

1. **Criar um evento**: Digite o nome da sua competição (ex: "Rodízio da galera")
2. **Compartilhar**: Copie o link e envie para os participantes
3. **Entrar**: Cada pessoa acessa o link, digita seu nome e começa a contar
4. **Competir**: Use os botões + e - para atualizar sua contagem
5. **Vencer**: Veja quem está no topo do ranking!

## Desenvolvimento local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

Acesse http://localhost:3000

**Nota**: Para desenvolvimento local, você precisará configurar o Vercel KV. Veja a seção de configuração abaixo.

## Configuração do Vercel KV

Este projeto usa Vercel KV (Redis) para armazenar os eventos e participantes. Isso permite que múltiplos usuários em diferentes dispositivos acessem os mesmos dados.

### Configuração Automática (Recomendado)

Quando você faz deploy na Vercel:

1. Acesse seu projeto na Vercel Dashboard
2. Vá em **Storage** → **Create Database**
3. Selecione **KV (Redis)** e clique em **Create**
4. A Vercel automaticamente conecta o database ao seu projeto
5. Faça redeploy do projeto (ou ele redeploya automaticamente)

Pronto! As variáveis de ambiente são configuradas automaticamente.

### Configuração Manual (Desenvolvimento Local)

Se quiser testar localmente:

1. Crie um KV database na Vercel (mesmo sem fazer deploy)
2. Copie as credenciais do database
3. Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   KV_REST_API_URL=your_url
   KV_REST_API_TOKEN=your_token
   KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
   ```
4. Execute `npm run dev`

## Deploy na Vercel

### Opção 1: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Opção 2: Via GitHub
1. Faça push do código para o GitHub
2. Acesse https://vercel.com
3. Importe o repositório
4. Deploy automático!

### Opção 3: Via Dashboard
1. Acesse https://vercel.com/new
2. Selecione este repositório
3. Clique em "Deploy"

## Tecnologias

- Next.js 14 (App Router + API Routes)
- TypeScript
- React
- Vercel KV (Redis) para persistência
- CSS puro (sem frameworks)

## Estrutura do projeto

```
gluta-nator/
├── app/                                    # Next.js App Router
│   ├── api/                               # API Routes
│   │   └── events/                        # Endpoints de eventos
│   │       ├── route.ts                   # POST criar evento
│   │       └── [id]/                      # Rotas do evento
│   │           ├── route.ts               # GET buscar evento
│   │           └── participants/          # Rotas de participantes
│   ├── event/[id]/                        # Página do evento
│   ├── layout.tsx                         # Layout principal
│   ├── page.tsx                           # Página inicial
│   └── globals.css                        # Estilos globais
├── lib/                                   # Utilitários
│   ├── events.ts                          # Cliente API (funções fetch)
│   └── kv.ts                              # Lógica Vercel KV (server-side)
└── public/                                # Arquivos estáticos
```

## Licença

MIT
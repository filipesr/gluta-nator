# 🍕 Gluta-nator 🍣

Contador de pedaços no rodízio - Transforme suas competições de pizza/sushi em algo épico!

## Funcionalidades

- ✨ Criar eventos de competição
- 👥 Múltiplos participantes por evento
- 📊 Ranking em tempo real
- 📱 Design responsivo para mobile
- 🔗 Compartilhamento fácil via link
- 💾 Dados salvos localmente no navegador

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

- Next.js 14 (App Router)
- TypeScript
- React
- LocalStorage para persistência
- CSS puro (sem frameworks)

## Estrutura do projeto

```
gluta-nator/
├── app/                    # Next.js App Router
│   ├── event/[id]/        # Página do evento
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── lib/                   # Utilitários
│   └── events.ts          # Gerenciamento de eventos
└── public/                # Arquivos estáticos
```

## Licença

MIT
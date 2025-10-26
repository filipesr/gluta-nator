# Gluta-nator

Aplicação Next.js para gerenciar disputas amistosas de pedaços de pizza, sushi ou qualquer rodízio. Cada evento possui um link
compartilhável onde os participantes controlam o próprio placar e acompanham o ranking em tempo real.

## Principais recursos

- Criação de eventos com slug automático e link `/event/<slug>` para compartilhamento rápido.
- Cadastro de participantes diretamente pelo navegador, com contador individual e destaque para o dispositivo atual.
- Atualizações em tempo real usando Firebase Realtime Database.
- Histórico local dos últimos eventos acessados no dispositivo.
- Interface responsiva e componentizada, pronta para evoluir em novos módulos.

## Stack

- [Next.js 14](https://nextjs.org/) com App Router.
- [React 18](https://react.dev/).
- [Firebase Realtime Database](https://firebase.google.com/docs/database) para persistência.

## Pré-requisitos

1. Crie um projeto no Firebase.
2. Habilite o **Realtime Database** em modo produção.
3. Ajuste as regras de segurança conforme necessidade. Para testes rápidos, você pode começar com:

   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

   > Para produção, restrinja leitura/escrita apenas às origens desejadas seguindo a [documentação de regras](https://firebase.google.com/docs/database/security).

4. Em **Configurações do projeto → Seus apps → Web**, gere as credenciais e copie o objeto `firebaseConfig`.

## Configuração do ambiente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.local.example` para `.env.local` e preencha com os valores gerados pelo Firebase:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=YOUR_FIREBASE_DATABASE_URL
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:3000` para criar eventos e testar o fluxo completo.

## Estrutura de pastas

```
app/
  layout.jsx           # Layout raiz com fonte global
  page.jsx             # Página inicial com formulário de criação
  event/[slug]/page.jsx# Página dinâmica do evento
components/
  HomeView.jsx         # Container da home, controla toasts e cards
  CreateEventForm.jsx  # Formulário para criar eventos e compartilhar link
  RecentEvents.jsx     # Lista de eventos recentes armazenados em localStorage
  EventDashboard.jsx   # Tela completa do evento com ranking e ações
  ConfigWarning.jsx    # Mensagem de configuração pendente do Firebase
  Toast.jsx            # Componente de feedback visual
lib/
  firebase.js          # Inicialização do Firebase e verificação de credenciais
  events.js            # Operações de evento/participante no Realtime Database
  recentEvents.js      # Utilitários para cache local de eventos
  participantStorage.js# Persistência do participante ativo por evento
  datetime.js          # Formatadores de datas e horários
```

## Deploy na Vercel

1. Faça login na Vercel e importe o repositório.
2. Em **Project Settings → Environment Variables**, cadastre as variáveis `NEXT_PUBLIC_FIREBASE_*` com os mesmos valores do `.env.local`.
3. O comando de build padrão (`npm run build`) e o output Next.js funcionam sem ajustes extras. Não são necessários rewrites manuais porque as rotas dinâmicas são resolvidas pelo próprio Next.
4. Conclua o deploy e compartilhe os links dos eventos normalmente.

## Próximos passos sugeridos

- Adicionar autenticação para garantir que apenas convidados editem os contadores.
- Permitir diferentes unidades (pedaços, pratos, pontos) com configuração por evento.
- Gerar estatísticas agregadas (média por participante, tempo médio entre incrementos).
- Criar testes automatizados para os hooks e utilitários do Firebase.

## Licença

Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

# Gluta-nator

Aplicação web simples para organizar disputas de pedaços de pizza, sushi ou qualquer rodízio. Crie um evento, convide o pessoal e cada participante controla sua própria contagem em tempo real pelo celular.

## Funcionalidades

- Criação de eventos com link compartilhável (`/event/<código>`)
- Cadastro de participantes diretamente pelo navegador
- Contador individual com botão de incremento protegido pelo próprio dispositivo
- Ranking atualizado em tempo real usando Firebase Realtime Database
- Destaque para o participante logado no dispositivo
- Histórico local dos eventos criados

## Pré-requisitos

O projeto é um site estático que depende do [Firebase Realtime Database](https://firebase.google.com/docs/database) para persistir os dados.

1. Crie um projeto no Firebase.
2. Habilite o **Realtime Database** no modo produção.
3. Em **Rules**, permita leitura pública e escrita restrita ao domínio da aplicação (ajuste conforme necessário):

   ```json
   {
     "rules": {
       ".read": true,
       ".write": "auth == null && request.time < timestamp.date(2099, 1, 1)"
     }
   }
   ```

   > Ajuste as regras para o nível de segurança desejado. Para limitar alterações aos seus domínios, consulte a [documentação de regras](https://firebase.google.com/docs/database/security).

4. No menu **Configurações do projeto → Seus apps**, gere uma configuração web e copie o objeto `firebaseConfig`.

## Configuração local

1. Clone o repositório e edite `config.js`, substituindo os valores `YOUR_FIREBASE_*` pelos dados reais do seu projeto Firebase:

   ```js
   export const firebaseConfig = {
     apiKey: 'xxxxxxxx',
     authDomain: 'xxxxxxxx.firebaseapp.com',
     databaseURL: 'https://xxxxxxxx-default-rtdb.firebaseio.com',
     projectId: 'xxxxxxxx',
     storageBucket: 'xxxxxxxx.appspot.com',
     messagingSenderId: 'xxxxxxxx',
     appId: '1:xxxxxxxx:web:xxxxxxxx'
   };
   ```

2. Abra o arquivo `index.html` em um servidor estático (por exemplo `npx serve .`) ou diretamente no navegador.

## Publicação na Vercel

1. Adicione este repositório à Vercel como projeto estático.
2. Em **Project Settings → Environment Variables**, cadastre as chaves do Firebase como variáveis (opcional) **ou** mantenha `config.js` com os valores reais antes do deploy.
3. Inclua o arquivo `vercel.json` abaixo (já presente no projeto) para que as rotas dinâmicas funcionem corretamente:

   ```json
   {
     "rewrites": [
       { "source": "/event/:slug", "destination": "/" }
     ]
   }
   ```

4. Faça o deploy. O site pode ser acessado pela raiz e as URLs do tipo `/event/<slug>` serão direcionadas para o placar correspondente.

## Uso

1. Na página inicial, informe o nome da competição e clique em **Criar e gerar link**.
2. Compartilhe o link com os participantes.
3. Cada pessoa adiciona o próprio nome e usa o botão **+1** para registrar cada pedaço consumido.
4. O ranking é atualizado em tempo real em todos os dispositivos conectados ao evento.

## Personalização

- Ajuste o visual editando `styles.css`.
- Novas regras de segurança ou recursos extras podem ser adicionados diretamente no Firebase.
- Caso queira outro backend em tempo real, substitua as funções em `main.js` responsáveis por `createEvent`, `addParticipant`, `incrementParticipant` e `removeParticipant`.

## Licença

Distribuído sob a licença MIT.

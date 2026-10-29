# StudyCard.IA

Aplicação de estudo com flashcards criada com React e TypeScript. Permite gerar cartões a partir de apontamentos, revisar conceitos e acompanhar o progresso de um baralho.

## Funcionalidades

- Geração de cartões com Gemini quando uma chave está configurada.
- Extração local por regras de texto, sem chave de API.
- Criação, edição, exclusão, importação e exportação de cartões em JSON.
- Filtros por cartões não vistos, em revisão e dominados.
- Temas claro e escuro e armazenamento do baralho no navegador.

## Tecnologias

React, TypeScript, Vite, Tailwind CSS, Express e SDK `@google/genai`.

## Executar localmente

É necessário ter Node.js e npm compatíveis com as versões declaradas em [package.json](package.json), além de Git caso use a clonagem.

```sh
git clone https://github.com/GabreHell/StudyCard.IA.git
cd StudyCard.IA
npm install
npm run dev
```

Acesse **http://localhost:3000**. A porta pode ser alterada pela variável de ambiente `PORT`.

O comando inicia o servidor Express e o Vite em modo de desenvolvimento. Não basta abrir `index.html` diretamente no navegador.

## Configuração da IA

Para usar Gemini, copie [.env.example](.env.example) para um arquivo chamado `.env` na raiz e substitua o valor de `GEMINI_API_KEY` pela sua chave. A chave é lida no servidor; não a publique no repositório.

Sem chave, ou com o valor de exemplo, o servidor usa extração local. Um formato adequado para experimentar é:

```text
Mitocôndria: Produz energia para a célula.
Ribossomo: Participa da síntese de proteínas.
```

A geração com IA depende de acesso ao modelo configurado em [server.ts](server.ts) e da disponibilidade da API. Quando ela falha, o sistema tenta a extração local, que pode não produzir cartões para todos os textos.

`APP_URL` aparece no arquivo de exemplo, mas não é utilizada pelo servidor atual para iniciar a aplicação.

## Comandos disponíveis

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Compila o front-end para `dist/`. |
| `npm run start` | Executa `server.ts`; o modo depende de `NODE_ENV`. |
| `npm run preview` | Pré-visualiza o front-end compilado, sem iniciar a API Express. |
| `npm run lint` | Verifica os tipos com `tsc --noEmit`. |

Os testes existentes em [src/utils/flashcards.test.ts](src/utils/flashcards.test.ts) usam o executor de testes do Node e podem ser iniciados, após instalar as dependências, com:

```sh
npx tsx --test src/utils/flashcards.test.ts
```

Não há um script `npm test` definido no projeto.

## Produção

Execute `npm run build`, configure `NODE_ENV=production` no ambiente do servidor e inicie `npm run start`. Nesse modo, o Express serve `dist/` e a rota `/api/generate-flashcards`.

O servidor executa TypeScript usando `tsx`, atualmente declarado nas dependências de desenvolvimento. Essa dependência precisa estar disponível na execução; uma instalação que omita todas as dependências de desenvolvimento não atende à configuração atual.

## Dados e uso

O baralho e o tema são guardados no `localStorage` do navegador, sem sincronização entre dispositivos. Exporte o baralho em JSON para manter uma cópia antes de limpar os dados do navegador. Gerar um novo baralho substitui os cartões atuais.

Quando Gemini está habilitado, os apontamentos são enviados ao serviço para geração. Sem a chave, a extração usa regras locais, com resultados diferentes dos produzidos pela IA.

## Estrutura

- [server.ts](server.ts): API de geração e servidor da aplicação.
- [src/App.tsx](src/App.tsx): estado, navegação e persistência.
- [src/components/](src/components/): interface de estudo e gestão dos cartões.
- [src/utils/flashcards.ts](src/utils/flashcards.ts): extração, filtros, progresso e importação/exportação.

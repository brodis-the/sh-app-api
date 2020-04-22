# SH-APP

## Tecnologias e Versões utilizadas:
* NodeJS - 12.13.0
  ```bash
  nvm install 12.13.0 ou nvm install v12.13.0
  ```
  Depois
  ```bash
  nvm use 12.13.0 ou nvm use v12.13.0
  ```
* NVM última versão disponível
    > Link para download e instalação no Windows -  <https://github.com/coreybutler/nvm-windows>

    > Link para download e instalação no Linux e MacOS -  <https://github.com/nvm-sh/nvm>
* PostgreSQL V.10.12
    > link para download e instalação Windows, Linux e MacOS - <https://www.enterprisedb.com/downloads/postgres-postgresql-downloads>

## Executando Migrations e Seeding do Banco de Dados
* Execute os comando abaixo para migrar todas as tabelas para o banco:
    ```bash
      npx knex migrate:latest
    ```
* Execute os comando abaixo para povoar todas as tabelas do banco:
    ```bash
      npx knex seed:run
    ```

## Rodando o projeto
* Instale todas as dependências rodando o comando:
    ```bash
    # Comando para ele criar e instalar todas as dependências do projeto que se encontram no arquivo package.json

    npm install
    ```
* Rode o comando para iniciar o projeto:
  ```bash
  npm start
  ```
* Acesse o endereço para verificar a mensagem de "Hello World" enviada para a raiz da API de testes:
  > <localhost:3333>

## Prontinho tudo instalado!

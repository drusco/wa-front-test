# Criador de Hierarquia de Palavras

O **Criador de Hierarquia de Palavras** é uma aplicação que permite criar listas de palavras de forma hierárquica, onde cada palavra pode ter sub-palavras, e assim sucessivamente. Esta aplicação tem como objetivo mostrar minhas habilidades em **Next.js**, **React** e **Typescript** para a empresa **WA Project**.

## Funcionalidades

- **Listas Hierárquicas**: Crie listas de palavras, onde cada palavra pode ter sub-palavras, formando uma hierarquia.
- **Drag and Drop**: Você pode reorganizar os itens da lista utilizando a funcionalidade de arrastar e soltar (drag and drop).
- **Reordenação via Botões**: Além do drag and drop, também é possível reordenar os itens usando botões.
- **Salvamento Local**: As listas podem ser salvas localmente através do uso do **Redux**.
- **Criação de Múltiplas Listas**: Você pode criar várias listas separadas dentro da aplicação.
- **Exportação para JSON**: As listas criadas podem ser baixadas em formato JSON, permitindo o uso dos dados em outras aplicações.

## Integração com Aplicação CLI

O formato JSON gerado por esta aplicação pode ser utilizado diretamente na minha aplicação **CLI em Java**, disponível no seguinte repositório: [wa-cli-test](https://github.com/drusco/wa-cli-test). A aplicação CLI utiliza esses arquivos JSON para processar dados de forma hierárquica.

## Como Executar o Projeto

Para rodar o projeto localmente, siga os seguintes passos:

1.  Instale as dependências com o comando:

```
npm install
```

1.  Em seguida, rode a aplicação com:

```
npm run dev
```

1.  Acesse a aplicação no navegador através do endereço:

```
http://localhost:3000
```

## Sobre o Projeto

Este projeto foi desenvolvido com o intuito de demonstrar um conjunto específico de habilidades em **React** e **Next.js**, focando em manipulação de dados, estados locais com **Redux**, e funcionalidades avançadas de interface, como o **drag and drop**.

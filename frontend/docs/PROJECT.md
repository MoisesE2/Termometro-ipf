-----

Perfeito\! Vamos criar uma documentação focada exclusivamente no **frontend** do seu projeto de termômetro em tempo real. Esta doc será útil para você e para qualquer pessoa que precise entender ou trabalhar no frontend.

Lembre-se que o backend será sua API Fastify com WebSockets, e o frontend em Next.js/React/TypeScript será um SPA que consome essa API.

-----

# Documentação do Frontend: Termômetro IPF

Esta documentação abrange o setup, desenvolvimento, estrutura e deploy do frontend do projeto Termômetro IPF.

-----

## 1\. Visão Geral do Frontend

O frontend do Termômetro IPF é uma **Single-Page Application (SPA)** desenvolvida com **Next.js**, **React** e **TypeScript**. Ela se comunica com uma API de backend (Node.js/Fastify) para obter dados em tempo real, principalmente via **WebSockets**, e exibi-los ao usuário.

  * **Tecnologias Principais:** Next.js, React, TypeScript.
  * **Modo de Operação:** SPA (Single-Page Application), gerada via `next export`.
  * **Comunicação com Backend:** Requisições HTTP (REST) e **WebSockets** para dados em tempo real.

-----

## 2\. Setup do Ambiente de Desenvolvimento

Para começar a trabalhar no frontend, siga os passos abaixo:

### 2.1. Clonar o Repositório (Monorepo)

Como o projeto é um monorepo, o frontend estará em uma subpasta.
Primeiro, clone o repositório principal:

```bash
git clone https://github.com/MoisesE2/Termometro-ipf.git
cd Termometro-ipf
```
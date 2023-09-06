# Secure RESTful API with NestJS, Prisma, and ZenStack

This is the companion project for the blog post [Building a Secure RESTful API Using NestJS and Prisma With Minimum Code](https://zenstack.dev/blog/nest-api).

## Overview

It demonstrates three different approaches to implementing a blogging API:

1. Traditional approach with writing authorization code manually: [traditional](/src/traditional/)
1. Declarative approach with defining access polices in the schema: [declarative](/src/declarative/)
1. Zen approach with installing an automatic CRUD API: [zen](/src/zen/)

## Getting started

1. npm install
1. npm run generate
1. npm run dev

Endpoints:

- /api/trad

  Endpoints for the traditional approach

- /api/decl

  Endpoints for the declarative approach

- /api/zen

  Endpoints for the zen approach

## Stack

- [NestJS](https://nestjs.com/)
- [Prisma](https://prisma.io)
- [ZenStack](https://github.com/zenstackhq/zenstack)

Join [ZenStack Discord](https://discord.gg/Ykhr738dUe) for help and support.

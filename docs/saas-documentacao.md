# Documentação do SaaS Prinzo

Este documento descreve, com base no código e nos arquivos do projeto, o que o Prinzo oferece hoje como produto SaaS.

## 1. Visão geral

O Prinzo é uma plataforma para criar catálogos digitais de produtos, organizar uma loja pública por loja e permitir pedidos e pagamentos por diferentes canais. O projeto é construído com Next.js, React e Supabase, com integrações para WhatsApp e Mercado Pago.

## 2. O que o SaaS oferece

### 2.1. Criação e gestão de lojas

O sistema permite criar lojas individuais, cada uma com:

- slug único para identificar a loja na URL;
- nome da loja;
- descrição;
- número de WhatsApp;
- e-mail do proprietário;
- senha ou vínculo de autenticação do proprietário.

As lojas são armazenadas na tabela stores e podem ter configurações específicas de aparência e pagamento.

### 2.2. Painel administrativo para o lojista

O painel administrativo permite que o proprietário da loja:

- faça login ou cadastro;
- veja e edite os dados da loja;
- configure o WhatsApp da loja;
- configure chave Pix, nome do titular, cidade e token do Mercado Pago;
- defina as formas de pagamento aceitas;
- personalize tema visual da loja (cores, fontes e fundo);
- envie e associe logo da loja;
- gerencie produtos e categorias;
- ativar ou revisar fluxo de assinatura.

### 2.3. Gestão de catálogo de produtos

No painel, é possível:

- cadastrar produtos;
- definir nome, descrição, preço, categoria e emojis;
- incluir uma imagem principal, múltiplas imagens e tags;
- definir posição de exibição no catálogo;
- editar e excluir produtos.

Os produtos são persistidos na tabela products.

### 2.4. Gestão de categorias

O sistema permite organizar produtos em categorias com:

- nome;
- slug;
- emoji.

As categorias são persistidas na tabela categories e associadas à loja através de store_id.

### 2.5. Loja pública para clientes

Cada loja possui uma página pública acessada pelo slug da loja. Nessa interface, o cliente pode:

- visualizar os produtos;
- filtrar por categorias;
- ordenar os produtos;
- ver imagens em galeria/lightbox;
- adicionar itens ao carrinho;
- escolher forma de entrega;
- adicionar observações ao pedido;
- escolher entre diferentes formas de pagamento.

### 2.6. Fluxo de compra e pedido

O fluxo de compra da loja pública oferece:

- carrinho com quantidade e subtotal;
- resumo do pedido;
- opção de retirar na loja ou entregar no endereço;
- observações no pedido;
- abertura de conversa no WhatsApp com resumo do pedido;
- pagamento via Pix com QR Code gerado no próprio fluxo;
- pagamento via Mercado Pago com redirecionamento ao checkout.

### 2.7. Formas de pagamento

O projeto implementa, de forma explícita, estas formas de pagamento:

- WhatsApp: o vendedor recebe um pedido com resumo do carrinho;
- Pix direto: gera um payload Pix e exibe QR Code para pagamento;
- Mercado Pago: cria uma preferência de pagamento para o pedido.

As lojas podem configurar quais métodos de pagamento estarão disponíveis.

### 2.8. Assinatura e acesso premium

O projeto também possui fluxo de assinatura mensal para as lojas, com integração ao Mercado Pago:

- cria checkout de assinatura;
- redireciona para a página do admin ao finalizar;
- usa webhook para atualizar o status da loja;
- marca a loja como ativa para assinatura.

Além disso, o sistema possui lógica de trial para a loja pública:

- a loja pode ter acesso inicial por período gratuito;
- o acesso pode ser bloqueado quando o trial expira e a assinatura não está ativa.

### 2.9. Personalização visual por loja

Cada loja pode ter uma identidade visual própria, com:

- cor primária;
- cor secundária;
- cor de fundo;
- cor de cards;
- cor de texto;
- família tipográfica.

Essas configurações são aplicadas na página pública e no painel administrativo.

### 2.10. Upload de imagens

O painel administrativo permite o upload de imagens para produtos através de uma rota de upload. As imagens são enviadas para o armazenamento do Supabase no bucket product-images.

### 2.11. Instalação como aplicativo (PWA)

A interface administrativa implementa suporte para instalação como Progressive Web App (PWA):

- captura o evento de instalação;
- permite instalar o app no navegador;
- marca o ambiente como standalone quando instalado.

## 3. Principais páginas e rotas do projeto

### 3.1. Página inicial comercial

A rota principal apresenta o Prinzo como uma plataforma para:

- catálogo digital;
- loja online;
- pedidos via WhatsApp;
- pagamento via Pix.

### 3.2. Página de administração

A rota /admin concentra o painel do lojista para gerir produtos, categorias, configurações e assinatura.

### 3.3. Página pública da loja

A rota /[storeSlug] exibe o catálogo da loja específica e o fluxo de compra.

### 3.4. Página de confirmação de pagamento

A rota /[storeSlug]/pagamento exibe o status do pagamento após o retorno do Mercado Pago.

### 3.5. Página de teste de pagamentos

A rota /test-payment é uma página de suporte para testar fluxos de pagamento e assinatura de forma manual.

## 4. Integrações principais

### 4.1. Supabase

O projeto usa Supabase para:

- armazenar dados das lojas, produtos e categorias;
- autenticar lojistas;
- armazenar imagens de produtos.

### 4.2. Mercado Pago

O projeto integra o Mercado Pago para:

- criar preferências de pagamento de pedidos;
- criar checkouts de assinatura mensal;
- processar webhooks de pagamento/assinatura.

### 4.3. WhatsApp

O projeto usa links de WhatsApp para:

- abrir conversa com o vendedor;
- enviar resumo do pedido;
- confirmar recebimento de pagamento.

## 5. Estrutura de dados principal

O sistema utiliza, de forma central, estas entidades:

- stores: lojas;
- products: produtos do catálogo;
- categories: categorias dos produtos.

Além disso, há colunas específicas para controle de assinatura e trial nas lojas, como:

- subscription_active;
- subscription_status;
- trial_start_date;
- trial_end_date;
- monthly_price;
- mp_access_token;
- mp_subscription_payment_id.

## 6. Resumo do que o produto oferece

Em resumo, o Prinzo oferece hoje:

- criação de lojas independentes;
- painel administrativo para gestão do catálogo;
- página pública de catálogo para clientes;
- carrinho e fluxo de pedido;
- pagamentos por WhatsApp, Pix e Mercado Pago;
- personalização visual por loja;
- upload de imagens;
- assinatura mensal com integração ao Mercado Pago;
- controle de acesso por trial e assinatura;
- suporte a instalação como aplicativo.

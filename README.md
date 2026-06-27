# ⛩️ Bleach Poems (Poetry-as-a-Service)

**Bleach Poems** é um projeto laboratório focado na construção de uma **Arquitetura Distribuída e Altamente Escalável**. Muito além de exibir poemas aleatórios na tela, a aplicação utiliza o domínio da poesia para explorar e implementar padrões de engenharia de software avançados para alta performance.

---

## 🛠️ Stack Tecnológica

* **Backend:** Go (Goroutines e Channels para concorrência)
* **Frontend:** React / Vite (SSR/CSR híbrido)
* **Write Model (Fonte da Verdade):** PostgreSQL
* **Read Model (Cache e Eventos):** Redis
* **Mensageria:** Redis Streams
* **Comunicação Real-Time:** Server-Sent Events (SSE)
* **Infraestrutura:** Docker e Docker Compose / Railway

---

## 🏗️ Arquitetura do Sistema

O sistema é construído sobre o padrão **CQRS** (Command Query Responsibility Segregation) aliado a **Event-Driven Architecture** (Arquitetura Orientada a Eventos).

```mermaid
graph TD
    subgraph Escrita (Write Model)
        Admin[Dashboard Admin] -->|POST /poem| PG[(PostgreSQL)]
        PG -->|Trigger: PoemCreated| RS[Redis Streams]
    end

    subgraph Processamento Assíncrono
        RS -->|Background Worker| W[Go Worker Process]
        W -->|Sincroniza| R[(Redis Hash / Set)]
    end

    subgraph Leitura e Tempo Real (Read Model)
        C[Cliente React] -->|GET /poem O(1)| R
        W -->|Broadcast Event| SSE[Broker SSE]
        SSE -->|Push Notifications| C
    end

    subgraph Analytics Não-Bloqueante
        C -->|POST /view| RS
        RS -->|Analytics Worker| Z[Redis Sorted Set - ZINCRBY]
    end
```

### O Fluxo:
1. **Escrita:** Novos poemas são salvos no **PostgreSQL** para garantir integridade e transações ACID.
2. **Eventos:** Imediatamente após o salvamento, um evento leve (`PoemCreated`) é disparado no **Redis Streams**.
3. **Background Worker:** Uma Goroutine em background captura o evento e insere os dados de forma otimizada para leitura no **Redis**.
4. **Leitura (O(1)):** Quando usuários acessam o site, a API serve o conteúdo diretamente da memória do Redis em frações de milissegundo, blindando o banco relacional contra "Table Scans".
5. **Real-Time (SSE):** O servidor realiza _push_ das atualizações diretamente para os navegadores conectados via Server-Sent Events, trocando o poema da tela simultaneamente para todos os usuários engajados, sem a necessidade de *short-polling*.

---

## 🧠 Problemas e Soluções (Design Decisions)

Durante o desenvolvimento, substituímos abordagens tradicionais por padrões focados em resiliência e escala:

* **Busca Aleatória Lenta ➔ Leitura In-Memory ($O(1)$)**
  * **Problema:** Um `ORDER BY RANDOM()` em um banco relacional causaria lentidão e exaustão de CPU em cenários de tráfego intenso.
  * **Solução:** O Redis mantém um `Set` nativo que permite o sorteio imediato de IDs em $O(1)$ (`SRANDMEMBER`).
* **Inconsistência no Dual-Write ➔ CQRS e Sincronização Assíncrona**
  * **Problema:** Escrever no Postgres e no Redis na mesma requisição HTTP aumenta a latência e cria um ponto único de falha.
  * **Solução:** Ao separar responsabilidades, o Postgres cuida apenas de armazenar com segurança, enquanto a comunicação com o Redis é feita posteriormente, nos bastidores, por uma fila de eventos, garantindo consistência eventual e resposta rápida ao cliente.
* **Gargalo de Rede por Short-Polling ➔ Server-Sent Events**
  * **Problema:** Múltiplos clientes disparando GETs contínuos ao backend apenas para perguntar "tem novidade?" saturam conexões.
  * **Solução:** Uma conexão unidirecional SSE empurra os dados, desonerando o servidor e a rede.
* **Locks no Banco (Contagem de Views) ➔ Event Sourcing Analytics**
  * **Problema:** Um `UPDATE poemas SET views = views + 1` causaria locks severos.
  * **Solução:** Gravar eventos imutáveis (`PoemViewed`) no Stream, que são processados por um worker assíncrono para incrementar um ranking em memória nativa (`ZINCRBY`), garantindo ausência de bloqueios transacionais.

---

## 🚀 Como Executar Localmente

**1. Clone e inicie a infraestrutura de dados:**
```bash
docker-compose up -d
```
*(Isso levantará o Redis e o PostgreSQL).*

**2. Configure as variáveis de ambiente:**
* Copie o arquivo `.env.example` para `.env` e ajuste se necessário.

**3. Inicie o Backend (Go):**
```bash
cd backend
go run main.go
```

**4. Inicie o Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```
O frontend estará acessível em `http://localhost:5173`.

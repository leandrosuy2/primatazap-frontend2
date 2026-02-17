# Backend Kanban — Guia Completo de Implementação

> Este documento lista **TODOS** os endpoints, tabelas, models, services, controllers e rotas que o frontend do Kanban espera do backend. Siga a ordem de execução no final.

---

## Sumário

1. [Novas Tabelas (Migrations)](#1-novas-tabelas-migrations)
2. [Models Sequelize](#2-models-sequelize)
3. [Endpoints — Quadro Groups (Áreas de Trabalho)](#3-endpoints--quadro-groups-áreas-de-trabalho)
4. [Endpoints — Quadro Statuses (Status Personalizados)](#4-endpoints--quadro-statuses-status-personalizados)
5. [Endpoints — Ticket Quadro (Dados do Card)](#5-endpoints--ticket-quadro-dados-do-card)
6. [Endpoints — Quadro Attachments (Anexos)](#6-endpoints--quadro-attachments-anexos)
7. [Endpoints — Quadro Logs (Histórico)](#7-endpoints--quadro-logs-histórico)
8. [Endpoints — Quadro Share (Compartilhar entre Áreas)](#8-endpoints--quadro-share-compartilhar-entre-áreas)
9. [Endpoints — Contact Processes (Processos do Contato)](#9-endpoints--contact-processes-processos-do-contato)
10. [Campos CRM no Contact (já documentado)](#10-campos-crm-no-contact)
11. [Rotas (routes)](#11-rotas-routes)
12. [Ordem de Execução](#12-ordem-de-execução)

---

## 1. Novas Tabelas (Migrations)

### 1.1 — Tabela `QuadroGroups` (Áreas de Trabalho)

```javascript
// migration: create-quadro-groups.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuadroGroups", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("QuadroGroups");
  },
};
```

### 1.2 — Tabela `QuadroStatuses` (Status Personalizados)

```javascript
// migration: create-quadro-statuses.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuadroStatuses", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING(9),
        allowNull: false,
        defaultValue: "#9e9e9e",
        comment: "Cor hex do badge, ex: #4caf50",
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("QuadroStatuses");
  },
};
```

### 1.3 — Tabela `TicketQuadros` (Dados do Card Kanban)

```javascript
// migration: create-ticket-quadros.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("TicketQuadros", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "aguardando",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      valorServico: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      valorEntrada: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      nomeProjeto: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Nome do projeto / empresa",
      },
      customFields: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON stringificado: [{name, value, type}]",
      },
      quadroGroupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "QuadroGroups", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        comment: "Área de trabalho principal deste card",
      },
      sharedGroupIds: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON array de IDs de grupos compartilhados, ex: [2,3]",
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("TicketQuadros");
  },
};
```

### 1.4 — Tabela `QuadroAttachments` (Anexos do Card)

```javascript
// migration: create-quadro-attachments.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuadroAttachments", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      isCapa: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("QuadroAttachments");
  },
};
```

### 1.5 — Tabela `QuadroLogs` (Histórico de Movimentação)

```javascript
// migration: create-quadro-logs.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuadroLogs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      fromLaneId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toLaneId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fromLabel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toLabel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("QuadroLogs");
  },
};
```

### 1.6 — Adicionar `quadroGroupId` na tabela `Tickets` (se não existir)

```javascript
// migration: add-quadroGroupId-to-tickets.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tickets", "quadroGroupId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "QuadroGroups", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Tickets", "quadroGroupId");
  },
};
```

---

## 2. Models Sequelize

### 2.1 — QuadroGroup

```javascript
// models/QuadroGroup.js (ou .ts)
module.exports = (sequelize, DataTypes) => {
  const QuadroGroup = sequelize.define("QuadroGroup", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  QuadroGroup.associate = (models) => {
    QuadroGroup.belongsTo(models.Company, { foreignKey: "companyId" });
    QuadroGroup.hasMany(models.Ticket, { foreignKey: "quadroGroupId", as: "tickets" });
    QuadroGroup.hasMany(models.TicketQuadro, { foreignKey: "quadroGroupId", as: "quadros" });
  };

  return QuadroGroup;
};
```

### 2.2 — QuadroStatus

```javascript
// models/QuadroStatus.js
module.exports = (sequelize, DataTypes) => {
  const QuadroStatus = sequelize.define("QuadroStatus", {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(9),
      allowNull: false,
      defaultValue: "#9e9e9e",
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  QuadroStatus.associate = (models) => {
    QuadroStatus.belongsTo(models.Company, { foreignKey: "companyId" });
  };

  return QuadroStatus;
};
```

### 2.3 — TicketQuadro

```javascript
// models/TicketQuadro.js
module.exports = (sequelize, DataTypes) => {
  const TicketQuadro = sequelize.define("TicketQuadro", {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "aguardando",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valorServico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    valorEntrada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    nomeProjeto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customFields: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("customFields");
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue("customFields", val ? JSON.stringify(val) : null);
      },
    },
    quadroGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sharedGroupIds: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue("sharedGroupIds");
        return raw ? JSON.parse(raw) : [];
      },
      set(val) {
        this.setDataValue("sharedGroupIds", val ? JSON.stringify(val) : null);
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  TicketQuadro.associate = (models) => {
    TicketQuadro.belongsTo(models.Ticket, { foreignKey: "ticketId", as: "ticket" });
    TicketQuadro.belongsTo(models.QuadroGroup, { foreignKey: "quadroGroupId", as: "group" });
    TicketQuadro.belongsTo(models.Company, { foreignKey: "companyId" });
    TicketQuadro.hasMany(models.QuadroAttachment, { foreignKey: "ticketId", sourceKey: "ticketId", as: "attachments" });
  };

  return TicketQuadro;
};
```

### 2.4 — QuadroAttachment

```javascript
// models/QuadroAttachment.js
module.exports = (sequelize, DataTypes) => {
  const QuadroAttachment = sequelize.define("QuadroAttachment", {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isCapa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  QuadroAttachment.associate = (models) => {
    QuadroAttachment.belongsTo(models.Ticket, { foreignKey: "ticketId" });
    QuadroAttachment.belongsTo(models.Company, { foreignKey: "companyId" });
  };

  return QuadroAttachment;
};
```

### 2.5 — QuadroLog

```javascript
// models/QuadroLog.js
module.exports = (sequelize, DataTypes) => {
  const QuadroLog = sequelize.define("QuadroLog", {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fromLaneId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toLaneId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fromLabel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toLabel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  QuadroLog.associate = (models) => {
    QuadroLog.belongsTo(models.Ticket, { foreignKey: "ticketId" });
    QuadroLog.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    QuadroLog.belongsTo(models.Company, { foreignKey: "companyId" });
  };

  return QuadroLog;
};
```

### 2.6 — Atualizar Model `Ticket`

Adicionar no model `Ticket`:

```javascript
// Dentro da definição do model Ticket, adicionar campo:
quadroGroupId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

// Dentro do associate:
Ticket.belongsTo(models.QuadroGroup, { foreignKey: "quadroGroupId", as: "quadroGroup" });
Ticket.hasOne(models.TicketQuadro, { foreignKey: "ticketId", as: "quadro" });
Ticket.hasMany(models.QuadroAttachment, { foreignKey: "ticketId", as: "quadroAttachments" });
Ticket.hasMany(models.QuadroLog, { foreignKey: "ticketId", as: "quadroLogs" });
```

---

## 3. Endpoints — Quadro Groups (Áreas de Trabalho)

### `GET /quadro-groups`

Retorna todas as áreas de trabalho da empresa. Se nenhuma existir, cria a default "Kanban".

**Response:**
```json
[
  { "id": 1, "name": "Kanban", "companyId": 1, "createdAt": "...", "updatedAt": "..." },
  { "id": 2, "name": "Ordem de Serviço", "companyId": 1, "createdAt": "...", "updatedAt": "..." }
]
```

**Service:**
```javascript
// services/QuadroGroupService/ListQuadroGroupsService.js
const ListQuadroGroupsService = async (companyId) => {
  let groups = await QuadroGroup.findAll({
    where: { companyId },
    order: [["createdAt", "ASC"]],
  });

  // Criar grupo padrão se não existir nenhum
  if (groups.length === 0) {
    const defaultGroup = await QuadroGroup.create({
      name: "Kanban",
      companyId,
    });
    groups = [defaultGroup];
  }

  return groups;
};
```

### `POST /quadro-groups`

Cria uma nova área de trabalho.

**Request Body:**
```json
{ "name": "Ordem de Serviço" }
```

**Response:**
```json
{ "id": 3, "name": "Ordem de Serviço", "companyId": 1 }
```

**Service:**
```javascript
const CreateQuadroGroupService = async ({ name, companyId }) => {
  if (!name || !name.trim()) throw new AppError("Nome é obrigatório", 400);

  const group = await QuadroGroup.create({
    name: name.trim(),
    companyId,
  });

  return group;
};
```

### `PUT /quadro-groups/:id`

Renomeia uma área de trabalho.

**Request Body:**
```json
{ "name": "Novo Nome" }
```

**Service:**
```javascript
const UpdateQuadroGroupService = async ({ id, name, companyId }) => {
  const group = await QuadroGroup.findOne({ where: { id, companyId } });
  if (!group) throw new AppError("Área não encontrada", 404);

  await group.update({ name: name.trim() });
  return group;
};
```

### `DELETE /quadro-groups/:id`

Exclui uma área de trabalho. Os tickets associados ficam com `quadroGroupId = null`.

**Service:**
```javascript
const DeleteQuadroGroupService = async ({ id, companyId }) => {
  const group = await QuadroGroup.findOne({ where: { id, companyId } });
  if (!group) throw new AppError("Área não encontrada", 404);

  // Desassociar tickets dessa área
  await Ticket.update(
    { quadroGroupId: null },
    { where: { quadroGroupId: id, companyId } }
  );

  await group.destroy();
};
```

**Controller:**
```javascript
// controllers/QuadroGroupController.js
const QuadroGroupController = {
  async index(req, res) {
    const { companyId } = req.user;
    const groups = await ListQuadroGroupsService(companyId);
    return res.json(groups);
  },

  async store(req, res) {
    const { companyId } = req.user;
    const { name } = req.body;
    const group = await CreateQuadroGroupService({ name, companyId });
    return res.status(201).json(group);
  },

  async update(req, res) {
    const { companyId } = req.user;
    const { id } = req.params;
    const { name } = req.body;
    const group = await UpdateQuadroGroupService({ id, name, companyId });
    return res.json(group);
  },

  async remove(req, res) {
    const { companyId } = req.user;
    const { id } = req.params;
    await DeleteQuadroGroupService({ id, companyId });
    return res.status(204).send();
  },
};
```

---

## 4. Endpoints — Quadro Statuses (Status Personalizados)

### `GET /quadro-statuses`

Retorna todos os status personalizados da empresa. Se nenhum existir, cria os padrões.

**Response:**
```json
{
  "statuses": [
    { "label": "Aguardando", "value": "aguardando", "color": "#fbc02d" },
    { "label": "Em andamento", "value": "em_andamento", "color": "#1976d2" },
    { "label": "Concluído", "value": "concluido", "color": "#388e3c" },
    { "label": "Cancelado", "value": "cancelado", "color": "#d32f2f" }
  ]
}
```

**Service:**
```javascript
const DEFAULT_STATUSES = [
  { label: "Aguardando", value: "aguardando", color: "#fbc02d", sortOrder: 0 },
  { label: "Em andamento", value: "em_andamento", color: "#1976d2", sortOrder: 1 },
  { label: "Concluído", value: "concluido", color: "#388e3c", sortOrder: 2 },
  { label: "Cancelado", value: "cancelado", color: "#d32f2f", sortOrder: 3 },
];

const ListQuadroStatusesService = async (companyId) => {
  let statuses = await QuadroStatus.findAll({
    where: { companyId },
    order: [["sortOrder", "ASC"]],
  });

  if (statuses.length === 0) {
    // Criar status padrão
    for (const s of DEFAULT_STATUSES) {
      await QuadroStatus.create({ ...s, companyId });
    }
    statuses = await QuadroStatus.findAll({
      where: { companyId },
      order: [["sortOrder", "ASC"]],
    });
  }

  return statuses.map((s) => ({
    label: s.label,
    value: s.value,
    color: s.color,
  }));
};
```

### `PUT /quadro-statuses`

Substitui todos os status (delete + recreate).

**Request Body:**
```json
{
  "statuses": [
    { "label": "Aguardando", "value": "aguardando", "color": "#fbc02d" },
    { "label": "Em andamento", "value": "em_andamento", "color": "#1976d2" },
    { "label": "Concluído", "value": "concluido", "color": "#388e3c" },
    { "label": "Cancelado", "value": "cancelado", "color": "#d32f2f" },
    { "label": "Em revisão", "value": "em_revisao", "color": "#9c27b0" }
  ]
}
```

**Service:**
```javascript
const UpdateQuadroStatusesService = async ({ statuses, companyId }) => {
  const transaction = await sequelize.transaction();
  try {
    // Remover todos os existentes
    await QuadroStatus.destroy({ where: { companyId }, transaction });

    // Recriar
    for (let i = 0; i < statuses.length; i++) {
      const s = statuses[i];
      await QuadroStatus.create(
        {
          label: s.label,
          value: s.value || s.label.toLowerCase().replace(/\s+/g, "_"),
          color: s.color || "#9e9e9e",
          sortOrder: i,
          companyId,
        },
        { transaction }
      );
    }

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};
```

**Controller:**
```javascript
// controllers/QuadroStatusController.js
const QuadroStatusController = {
  async index(req, res) {
    const { companyId } = req.user;
    const statuses = await ListQuadroStatusesService(companyId);
    return res.json({ statuses });
  },

  async update(req, res) {
    const { companyId } = req.user;
    const { statuses } = req.body;
    await UpdateQuadroStatusesService({ statuses, companyId });
    return res.json({ message: "Status atualizados." });
  },
};
```

---

## 5. Endpoints — Ticket Quadro (Dados do Card)

### `GET /tickets/:ticketUuid/quadro`

Retorna os dados do quadro kanban associados ao ticket + anexos.

> **ATENÇÃO**: O frontend usa o **UUID** do ticket neste endpoint (não o ID numérico).

**Response:**
```json
{
  "quadro": {
    "id": 1,
    "ticketId": 123,
    "status": "em_andamento",
    "description": "<p>Descrição do card...</p>",
    "valorServico": 1500.00,
    "valorEntrada": 500.00,
    "nomeProjeto": "Projeto X",
    "customFields": [
      { "name": "CPF", "value": "123.456.789-00", "type": "text" },
      { "name": "CNPJ", "value": "12.345.678/0001-00", "type": "text" }
    ]
  },
  "attachments": [
    {
      "id": 1,
      "name": "foto.jpg",
      "url": "/public/quadro/foto.jpg",
      "isCapa": true,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

**Service:**
```javascript
const ShowTicketQuadroService = async (ticketUuid, companyId) => {
  // Buscar ticket pelo UUID
  const ticket = await Ticket.findOne({
    where: { uuid: ticketUuid, companyId },
  });
  if (!ticket) throw new AppError("Ticket não encontrado", 404);

  // Buscar ou criar quadro
  let quadro = await TicketQuadro.findOne({
    where: { ticketId: ticket.id },
  });

  if (!quadro) {
    quadro = await TicketQuadro.create({
      ticketId: ticket.id,
      status: "aguardando",
      companyId,
      quadroGroupId: ticket.quadroGroupId,
    });
  }

  // Buscar anexos
  const attachments = await QuadroAttachment.findAll({
    where: { ticketId: ticket.id },
    order: [["createdAt", "ASC"]],
  });

  return { quadro, attachments };
};
```

### `PUT /tickets/:ticketId/quadro`

Atualiza dados gerais do quadro (valores, nome do projeto, campos personalizados).

> **ATENÇÃO**: Aqui o frontend usa o **ID numérico** do ticket.

**Request Body:**
```json
{
  "valorServico": 2000.00,
  "valorEntrada": 800.00,
  "nomeProjeto": "Projeto ABC",
  "customFields": [
    { "name": "CPF", "value": "123.456.789-00", "type": "text" },
    { "name": "Endereço", "value": "Rua X, 123", "type": "text" }
  ]
}
```

**Service:**
```javascript
const UpdateTicketQuadroService = async ({ ticketId, data, companyId }) => {
  let quadro = await TicketQuadro.findOne({ where: { ticketId } });

  if (!quadro) {
    quadro = await TicketQuadro.create({
      ticketId,
      companyId,
      ...data,
    });
  } else {
    await quadro.update(data);
  }

  return quadro;
};
```

### `PUT /tickets/:ticketId/quadro/description`

Atualiza apenas a descrição (rich text HTML).

**Request Body:**
```json
{ "description": "<p>Nova descrição do card...</p>" }
```

### `PUT /tickets/:ticketId/quadro/status`

Atualiza apenas o status do card.

**Request Body:**
```json
{ "status": "concluido" }
```

**Controller:**
```javascript
// controllers/TicketQuadroController.js
const TicketQuadroController = {
  async show(req, res) {
    const { ticketUuid } = req.params;
    const { companyId } = req.user;
    const result = await ShowTicketQuadroService(ticketUuid, companyId);
    return res.json(result);
  },

  async update(req, res) {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    const data = req.body; // { valorServico, valorEntrada, nomeProjeto, customFields }
    const quadro = await UpdateTicketQuadroService({ ticketId, data, companyId });
    return res.json(quadro);
  },

  async updateDescription(req, res) {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    const { description } = req.body;
    const quadro = await UpdateTicketQuadroService({
      ticketId,
      data: { description },
      companyId,
    });
    return res.json(quadro);
  },

  async updateStatus(req, res) {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    const { status } = req.body;
    const quadro = await UpdateTicketQuadroService({
      ticketId,
      data: { status },
      companyId,
    });
    return res.json(quadro);
  },
};
```

---

## 6. Endpoints — Quadro Attachments (Anexos)

### `POST /tickets/:ticketId/quadro/attachments`

Upload de arquivo (multipart/form-data). Salvar o arquivo em disco/S3 e retornar os dados.

**Request:** `multipart/form-data` com campo `file`

**Response:**
```json
{
  "attachment": {
    "id": 5,
    "name": "documento.pdf",
    "url": "/public/quadro/documento.pdf",
    "isCapa": false,
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Service:**
```javascript
const CreateQuadroAttachmentService = async ({ ticketId, file, companyId }) => {
  // Salvar arquivo no disco/S3 (usar mesma lógica de upload que já existe)
  const url = `/public/quadro/${companyId}/${file.filename}`;

  const attachment = await QuadroAttachment.create({
    ticketId,
    name: file.originalname,
    url,
    isCapa: false,
    companyId,
  });

  return attachment;
};
```

### `PATCH /tickets/:ticketId/quadro/attachments/:attachmentId/capa`

Define um anexo como capa do card (remove capa dos outros).

**Service:**
```javascript
const SetQuadroAttachmentCapaService = async ({ ticketId, attachmentId, companyId }) => {
  // Remover capa de todos os anexos deste ticket
  await QuadroAttachment.update(
    { isCapa: false },
    { where: { ticketId, companyId } }
  );

  // Marcar o selecionado como capa
  const attachment = await QuadroAttachment.findOne({
    where: { id: attachmentId, ticketId },
  });
  if (!attachment) throw new AppError("Anexo não encontrado", 404);

  await attachment.update({ isCapa: true });
  return attachment;
};
```

### `DELETE /tickets/:ticketId/quadro/attachments/:attachmentId`

Exclui um anexo.

**Service:**
```javascript
const DeleteQuadroAttachmentService = async ({ ticketId, attachmentId, companyId }) => {
  const attachment = await QuadroAttachment.findOne({
    where: { id: attachmentId, ticketId, companyId },
  });
  if (!attachment) throw new AppError("Anexo não encontrado", 404);

  // Apagar arquivo do disco/S3 também
  // fs.unlinkSync(path.resolve(publicFolder, attachment.url)); // ajustar conforme

  await attachment.destroy();
};
```

**Controller:**
```javascript
// controllers/QuadroAttachmentController.js
const QuadroAttachmentController = {
  async store(req, res) {
    const { ticketId } = req.params;
    const { companyId } = req.user;
    const file = req.file; // multer
    const attachment = await CreateQuadroAttachmentService({ ticketId, file, companyId });
    return res.status(201).json({ attachment });
  },

  async setCapa(req, res) {
    const { ticketId, attachmentId } = req.params;
    const { companyId } = req.user;
    const attachment = await SetQuadroAttachmentCapaService({ ticketId, attachmentId, companyId });
    return res.json(attachment);
  },

  async remove(req, res) {
    const { ticketId, attachmentId } = req.params;
    const { companyId } = req.user;
    await DeleteQuadroAttachmentService({ ticketId, attachmentId, companyId });
    return res.status(204).send();
  },
};
```

---

## 7. Endpoints — Quadro Logs (Histórico)

### `GET /tickets/:ticketId/quadro/logs`

Retorna o histórico de movimentações do card.

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "fromLabel": "Em aberto",
      "toLabel": "Em andamento",
      "userName": "Murilo",
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "fromLabel": "Em andamento",
      "toLabel": "Concluído",
      "userName": "Murilo",
      "createdAt": "2025-01-16T14:20:00.000Z"
    }
  ]
}
```

**Service:**
```javascript
const ListQuadroLogsService = async (ticketId) => {
  const logs = await QuadroLog.findAll({
    where: { ticketId },
    include: [
      { model: User, as: "user", attributes: ["id", "name"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return logs.map((log) => ({
    id: log.id,
    fromLaneId: log.fromLaneId,
    toLaneId: log.toLaneId,
    fromLabel: log.fromLabel,
    toLabel: log.toLabel,
    userName: log.user?.name || "Sistema",
    createdAt: log.createdAt,
  }));
};
```

### `POST /tickets/:ticketId/quadro/log`

Registra uma movimentação (quando o card troca de coluna).

**Request Body:**
```json
{
  "fromLaneId": "tag-123",
  "toLaneId": "tag-456",
  "fromLabel": "Em aberto",
  "toLabel": "Em andamento"
}
```

**Service:**
```javascript
const CreateQuadroLogService = async ({ ticketId, userId, fromLaneId, toLaneId, fromLabel, toLabel, companyId }) => {
  const log = await QuadroLog.create({
    ticketId,
    userId,
    fromLaneId,
    toLaneId,
    fromLabel,
    toLabel,
    companyId,
  });
  return log;
};
```

**Controller:**
```javascript
// controllers/QuadroLogController.js
const QuadroLogController = {
  async index(req, res) {
    const { ticketId } = req.params;
    const logs = await ListQuadroLogsService(ticketId);
    return res.json({ logs });
  },

  async store(req, res) {
    const { ticketId } = req.params;
    const { companyId, id: userId } = req.user;
    const { fromLaneId, toLaneId, fromLabel, toLabel } = req.body;

    const log = await CreateQuadroLogService({
      ticketId,
      userId,
      fromLaneId,
      toLaneId,
      fromLabel,
      toLabel,
      companyId,
    });

    return res.status(201).json(log);
  },
};
```

---

## 8. Endpoints — Quadro Share (Compartilhar entre Áreas)

### `POST /tickets/:ticketId/quadro/share`

Compartilha um card (ticket) em múltiplas áreas de trabalho.

**Request Body:**
```json
{
  "groupIds": [2, 3]
}
```

**Service:**
```javascript
const ShareTicketQuadroService = async ({ ticketId, groupIds, companyId }) => {
  let quadro = await TicketQuadro.findOne({ where: { ticketId } });

  if (!quadro) {
    quadro = await TicketQuadro.create({
      ticketId,
      companyId,
      sharedGroupIds: groupIds,
    });
  } else {
    await quadro.update({ sharedGroupIds: groupIds });
  }

  return quadro;
};
```

**Controller:**
```javascript
// Adicionar no TicketQuadroController
async share(req, res) {
  const { ticketId } = req.params;
  const { companyId } = req.user;
  const { groupIds } = req.body;
  const quadro = await ShareTicketQuadroService({ ticketId, groupIds, companyId });
  return res.json(quadro);
},
```

---

## 9. Endpoints — Contact Processes (Processos do Contato)

### `GET /contacts/:contactId/processes`

Retorna as áreas de trabalho em que o contato participa e quantos cards ele tem em cada uma.

**Response:**
```json
{
  "processes": [
    { "groupId": 1, "groupName": "Kanban", "count": 5 },
    { "groupId": 2, "groupName": "Ordem de Serviço", "count": 3 },
    { "groupId": 3, "groupName": "Orçamento", "count": 1 }
  ]
}
```

**Service:**
```javascript
const ListContactProcessesService = async (contactId, companyId) => {
  // Buscar todos os tickets do contato
  const tickets = await Ticket.findAll({
    where: { contactId, companyId },
    attributes: ["id", "quadroGroupId"],
    include: [
      {
        model: TicketQuadro,
        as: "quadro",
        attributes: ["quadroGroupId", "sharedGroupIds"],
        required: false,
      },
    ],
  });

  // Agrupar por quadroGroupId (considerando também sharedGroupIds)
  const groupCountMap = {};

  for (const ticket of tickets) {
    // Grupo principal
    const mainGroupId = ticket.quadroGroupId || ticket.quadro?.quadroGroupId || 1;
    groupCountMap[mainGroupId] = (groupCountMap[mainGroupId] || 0) + 1;

    // Grupos compartilhados
    const shared = ticket.quadro?.sharedGroupIds || [];
    for (const gId of shared) {
      groupCountMap[gId] = (groupCountMap[gId] || 0) + 1;
    }
  }

  // Buscar nomes dos grupos
  const groupIds = Object.keys(groupCountMap).map(Number);
  const groups = await QuadroGroup.findAll({
    where: { id: groupIds, companyId },
    attributes: ["id", "name"],
  });

  const groupNameMap = {};
  for (const g of groups) {
    groupNameMap[g.id] = g.name;
  }

  // Montar resposta
  const processes = Object.entries(groupCountMap).map(([gId, count]) => ({
    groupId: Number(gId),
    groupName: groupNameMap[Number(gId)] || "Kanban",
    count,
  }));

  return processes;
};
```

**Controller:**
```javascript
// Adicionar no ContactController
async processes(req, res) {
  const { contactId } = req.params;
  const { companyId } = req.user;
  const processes = await ListContactProcessesService(contactId, companyId);
  return res.json({ processes });
},
```

---

## 10. Campos CRM no Contact

Já documentado em `BACKEND_UPDATE_CRM_FIELDS.md`. Resumo:
- Migration para adicionar campos: `country`, `city`, `state`, `leadOrigin`, `entryDate`, `exitDate`, `dealValue`, `company`, `position`, `productsInterest`, `observation`
- Atualizar Model, Service e Controller do Contact

---

## 11. Rotas (routes)

Adicionar no arquivo de rotas (`routes.js` ou similar):

```javascript
const express = require("express");
const multer = require("multer");
const uploadConfig = require("../config/upload"); // ajustar path

const upload = multer(uploadConfig);

// Importar controllers
const QuadroGroupController = require("../controllers/QuadroGroupController");
const QuadroStatusController = require("../controllers/QuadroStatusController");
const TicketQuadroController = require("../controllers/TicketQuadroController");
const QuadroAttachmentController = require("../controllers/QuadroAttachmentController");
const QuadroLogController = require("../controllers/QuadroLogController");

// ==========================================
// QUADRO GROUPS (ÁREAS DE TRABALHO)
// ==========================================
app.get("/quadro-groups", isAuth, QuadroGroupController.index);
app.post("/quadro-groups", isAuth, QuadroGroupController.store);
app.put("/quadro-groups/:id", isAuth, QuadroGroupController.update);
app.delete("/quadro-groups/:id", isAuth, QuadroGroupController.remove);

// ==========================================
// QUADRO STATUSES (STATUS PERSONALIZADOS)
// ==========================================
app.get("/quadro-statuses", isAuth, QuadroStatusController.index);
app.put("/quadro-statuses", isAuth, QuadroStatusController.update);

// ==========================================
// TICKET QUADRO (DADOS DO CARD)
// ==========================================
app.get("/tickets/:ticketUuid/quadro", isAuth, TicketQuadroController.show);
app.put("/tickets/:ticketId/quadro", isAuth, TicketQuadroController.update);
app.put("/tickets/:ticketId/quadro/description", isAuth, TicketQuadroController.updateDescription);
app.put("/tickets/:ticketId/quadro/status", isAuth, TicketQuadroController.updateStatus);

// ==========================================
// QUADRO ATTACHMENTS (ANEXOS)
// ==========================================
app.post("/tickets/:ticketId/quadro/attachments", isAuth, upload.single("file"), QuadroAttachmentController.store);
app.patch("/tickets/:ticketId/quadro/attachments/:attachmentId/capa", isAuth, QuadroAttachmentController.setCapa);
app.delete("/tickets/:ticketId/quadro/attachments/:attachmentId", isAuth, QuadroAttachmentController.remove);

// ==========================================
// QUADRO LOGS (HISTÓRICO)
// ==========================================
app.get("/tickets/:ticketId/quadro/logs", isAuth, QuadroLogController.index);
app.post("/tickets/:ticketId/quadro/log", isAuth, QuadroLogController.store);

// ==========================================
// QUADRO SHARE (COMPARTILHAR ENTRE ÁREAS)
// ==========================================
app.post("/tickets/:ticketId/quadro/share", isAuth, TicketQuadroController.share);

// ==========================================
// CONTACT PROCESSES (PROCESSOS DO CONTATO)
// ==========================================
app.get("/contacts/:contactId/processes", isAuth, ContactController.processes);
```

---

## 12. Ordem de Execução

```
Passo 1 → Criar e rodar TODAS as migrations (seção 1)
           1.1 QuadroGroups
           1.2 QuadroStatuses
           1.3 TicketQuadros
           1.4 QuadroAttachments
           1.5 QuadroLogs
           1.6 Adicionar quadroGroupId em Tickets
           + Migration de campos CRM no Contact (BACKEND_UPDATE_CRM_FIELDS.md)

Passo 2 → Criar/atualizar TODOS os models (seção 2)
           - QuadroGroup
           - QuadroStatus
           - TicketQuadro
           - QuadroAttachment
           - QuadroLog
           - Atualizar Ticket (adicionar associations)
           - Atualizar Contact (adicionar campos CRM)

Passo 3 → Criar os Services (seções 3-9)

Passo 4 → Criar os Controllers (seções 3-9)

Passo 5 → Registrar as Rotas (seção 11)

Passo 6 → Testar cada endpoint via Postman/Insomnia:
           □ GET    /quadro-groups
           □ POST   /quadro-groups
           □ PUT    /quadro-groups/:id
           □ DELETE /quadro-groups/:id
           □ GET    /quadro-statuses
           □ PUT    /quadro-statuses
           □ GET    /tickets/:uuid/quadro
           □ PUT    /tickets/:id/quadro
           □ PUT    /tickets/:id/quadro/description
           □ PUT    /tickets/:id/quadro/status
           □ POST   /tickets/:id/quadro/attachments
           □ PATCH  /tickets/:id/quadro/attachments/:aid/capa
           □ DELETE /tickets/:id/quadro/attachments/:aid
           □ GET    /tickets/:id/quadro/logs
           □ POST   /tickets/:id/quadro/log
           □ POST   /tickets/:id/quadro/share
           □ GET    /contacts/:id/processes

Passo 7 → (Opcional) Rodar script de migração de dados existentes
```

---

## Resumo — Tabelas Novas

| Tabela | Descrição |
|---|---|
| `QuadroGroups` | Áreas de trabalho (Kanban, Ordem de Serviço, etc.) |
| `QuadroStatuses` | Status personalizados com cor (Aguardando, Em andamento, etc.) |
| `TicketQuadros` | Dados do card kanban (status, descrição, valores, campos) |
| `QuadroAttachments` | Anexos/imagens do card |
| `QuadroLogs` | Histórico de movimentação entre colunas |

## Resumo — Total de Endpoints Novos

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/quadro-groups` | Listar áreas de trabalho |
| `POST` | `/quadro-groups` | Criar área de trabalho |
| `PUT` | `/quadro-groups/:id` | Renomear área |
| `DELETE` | `/quadro-groups/:id` | Excluir área |
| `GET` | `/quadro-statuses` | Listar status personalizados |
| `PUT` | `/quadro-statuses` | Salvar status personalizados |
| `GET` | `/tickets/:uuid/quadro` | Dados do card (por UUID) |
| `PUT` | `/tickets/:id/quadro` | Atualizar dados do card |
| `PUT` | `/tickets/:id/quadro/description` | Atualizar descrição |
| `PUT` | `/tickets/:id/quadro/status` | Atualizar status |
| `POST` | `/tickets/:id/quadro/attachments` | Upload de anexo |
| `PATCH` | `/tickets/:id/quadro/attachments/:aid/capa` | Definir capa |
| `DELETE` | `/tickets/:id/quadro/attachments/:aid` | Excluir anexo |
| `GET` | `/tickets/:id/quadro/logs` | Listar histórico |
| `POST` | `/tickets/:id/quadro/log` | Registrar movimentação |
| `POST` | `/tickets/:id/quadro/share` | Compartilhar card |
| `GET` | `/contacts/:id/processes` | Processos do contato |

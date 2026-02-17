# Atualização do Backend - Novos Campos CRM do Contato

## Contexto

O frontend foi atualizado com um novo painel de dados do contato (ContactDrawer) que inclui campos de CRM. Atualmente, os campos extras estão sendo salvos via `extraInfo` (array de `{name, value}`), que já funciona sem alteração no backend.

Porém, para melhor performance, validação e consulta (filtros, relatórios), é **recomendado** criar colunas nativas na tabela `Contacts`.

---

## 1. Migration - Novos campos na tabela `Contacts`

Crie uma migration para adicionar as novas colunas:

```javascript
// migration: add-crm-fields-to-contacts.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn("Contacts", "country", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "city", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "state", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "leadOrigin", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "whatsapp | facebook | instagram | site | indicacao | google | outro",
      }, { transaction });

      await queryInterface.addColumn("Contacts", "entryDate", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "exitDate", {
        type: Sequelize.DATEONLY,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "dealValue", {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "company", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await queryInterface.addColumn("Contacts", "position", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Cargo do contato",
      }, { transaction });

      await queryInterface.addColumn("Contacts", "productsInterest", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
        comment: "Produtos de interesse separados por vírgula",
      }, { transaction });

      await queryInterface.addColumn("Contacts", "observation", {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn("Contacts", "country", { transaction });
      await queryInterface.removeColumn("Contacts", "city", { transaction });
      await queryInterface.removeColumn("Contacts", "state", { transaction });
      await queryInterface.removeColumn("Contacts", "leadOrigin", { transaction });
      await queryInterface.removeColumn("Contacts", "entryDate", { transaction });
      await queryInterface.removeColumn("Contacts", "exitDate", { transaction });
      await queryInterface.removeColumn("Contacts", "dealValue", { transaction });
      await queryInterface.removeColumn("Contacts", "company", { transaction });
      await queryInterface.removeColumn("Contacts", "position", { transaction });
      await queryInterface.removeColumn("Contacts", "productsInterest", { transaction });
      await queryInterface.removeColumn("Contacts", "observation", { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
```

---

## 2. Model - Atualizar o model `Contact`

Adicione os novos campos no model Sequelize do Contact:

```javascript
// Adicionar dentro da definição do model Contact

country: {
  type: DataTypes.STRING,
  allowNull: true,
},
city: {
  type: DataTypes.STRING,
  allowNull: true,
},
state: {
  type: DataTypes.STRING,
  allowNull: true,
},
leadOrigin: {
  type: DataTypes.STRING,
  allowNull: true,
},
entryDate: {
  type: DataTypes.DATEONLY,
  allowNull: true,
},
exitDate: {
  type: DataTypes.DATEONLY,
  allowNull: true,
},
dealValue: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  defaultValue: 0,
},
company: {
  type: DataTypes.STRING,
  allowNull: true,
},
position: {
  type: DataTypes.STRING,
  allowNull: true,
},
productsInterest: {
  type: DataTypes.TEXT,
  allowNull: true,
},
observation: {
  type: DataTypes.TEXT,
  allowNull: true,
},
```

---

## 3. Service - Atualizar `CreateContactService` e `UpdateContactService`

Nos services de criação e atualização do contato, aceite os novos campos:

```javascript
// UpdateContactService.ts / CreateContactService.ts

interface ContactData {
  name: string;
  number: string;
  email?: string;
  // ... campos existentes ...

  // Novos campos CRM
  country?: string;
  city?: string;
  state?: string;
  leadOrigin?: string;
  entryDate?: string;
  exitDate?: string;
  dealValue?: number;
  company?: string;
  position?: string;
  productsInterest?: string;
  observation?: string;
}
```

No `UpdateContactService`, certifique-se de incluir os campos no `update()`:

```javascript
await contact.update({
  name,
  number,
  email,
  // ... campos existentes ...
  country,
  city,
  state,
  leadOrigin,
  entryDate,
  exitDate,
  dealValue,
  company,
  position,
  productsInterest,
  observation,
  extraInfo,
});
```

---

## 4. Controller - Atualizar `ContactController`

No `store` e `update` do controller, extraia os novos campos do `req.body`:

```javascript
// ContactController - update
const {
  name,
  number,
  email,
  extraInfo,
  // Novos campos CRM
  country,
  city,
  state,
  leadOrigin,
  entryDate,
  exitDate,
  dealValue,
  company,
  position,
  productsInterest,
  observation,
} = req.body;
```

---

## 5. Frontend - Atualizar o ContactDrawer (após backend pronto)

Depois que o backend estiver atualizado com os campos nativos, atualize o `ContactDrawer` no frontend para usar campos diretos em vez de `extraInfo`.

No arquivo `src/components/ContactDrawer/index.js`, troque o `handleSaveField` para enviar os campos diretamente:

```javascript
// ANTES (usando extraInfo):
const extraFieldMap = {
  country: "pais",
  city: "cidade",
  // ...
};
extraInfo = setExtraInfoValue(extraInfo, extraName, value);
updateData.extraInfo = extraInfo;

// DEPOIS (campos nativos):
const handleSaveField = async (field) => {
  if (!contact?.id) return;
  setSaving(true);
  try {
    const updateData = { [field]: formData[field] };

    // Campo especial: products -> productsInterest
    if (field === "products") {
      updateData.productsInterest = formData.products.join(", ");
      delete updateData.products;
    }

    await api.put(`/contacts/${contact.id}`, updateData);
    setEditingField(null);
  } catch (err) {
    toastError(err);
  }
  setSaving(false);
};
```

E no `useEffect` que carrega os dados, troque de `getExtraInfoValue` para leitura direta:

```javascript
useEffect(() => {
  if (contact?.id) {
    setFormData({
      name: contact.name || "",
      email: contact.email || "",
      country: contact.country || "",
      city: contact.city || "",
      state: contact.state || "",
      leadOrigin: contact.leadOrigin || "",
      entryDate: contact.entryDate || "",
      exitDate: contact.exitDate || "",
      dealValue: contact.dealValue || "0,00",
      company: contact.company || "",
      position: contact.position || "",
      productInput: "",
      products: contact.productsInterest
        ? contact.productsInterest.split(",").map(p => p.trim()).filter(Boolean)
        : [],
      observation: contact.observation || "",
    });
  }
}, [contact]);
```

---

## 6. Migração de dados existentes (opcional)

Se já existirem contatos com esses dados salvos em `extraInfo`, rode um script para migrar:

```javascript
// Script de migração de extraInfo para campos nativos

const migrateExtraInfoToNativeFields = async () => {
  const contacts = await Contact.findAll({
    where: {
      extraInfo: { [Op.ne]: null }
    }
  });

  const fieldMap = {
    pais: "country",
    cidade: "city",
    estado: "state",
    origem_lead: "leadOrigin",
    data_entrada: "entryDate",
    data_saida: "exitDate",
    valor_negocio: "dealValue",
    empresa: "company",
    cargo: "position",
    produtos_interesse: "productsInterest",
    observacao: "observation",
  };

  for (const contact of contacts) {
    const extraInfo = contact.extraInfo || [];
    const updates = {};

    extraInfo.forEach((info) => {
      const nativeField = fieldMap[info.name?.toLowerCase()];
      if (nativeField && info.value) {
        updates[nativeField] = info.value;
      }
    });

    if (Object.keys(updates).length > 0) {
      // Remove os campos migrados do extraInfo
      const remainingExtraInfo = extraInfo.filter(
        (info) => !fieldMap[info.name?.toLowerCase()]
      );

      await contact.update({
        ...updates,
        extraInfo: remainingExtraInfo,
      });
    }
  }

  console.log(`Migração concluída: ${contacts.length} contatos processados`);
};
```

---

## Tabela de Referência - Mapeamento dos Campos

| Campo Frontend | Campo extraInfo (atual) | Campo Nativo (novo) | Tipo SQL | Descrição |
|---|---|---|---|---|
| Nome | - | `name` (já existe) | STRING | Nome do contato |
| Email | - | `email` (já existe) | STRING | Email do contato |
| País | `pais` | `country` | STRING | País |
| Cidade | `cidade` | `city` | STRING | Cidade |
| Estado | `estado` | `state` | STRING | Estado/UF |
| Origem do Lead | `origem_lead` | `leadOrigin` | STRING | Origem (whatsapp, facebook, etc.) |
| Data de Entrada | `data_entrada` | `entryDate` | DATEONLY | Data de entrada do lead |
| Data de Saída | `data_saida` | `exitDate` | DATEONLY | Data de saída do lead |
| Valor do Negócio | `valor_negocio` | `dealValue` | DECIMAL(10,2) | Valor em R$ |
| Empresa | `empresa` | `company` | STRING | Empresa do contato |
| Cargo | `cargo` | `position` | STRING | Cargo/função |
| Produtos de Interesse | `produtos_interesse` | `productsInterest` | TEXT | Lista separada por vírgula |
| Observação | `observacao` | `observation` | TEXT | Observações gerais |

---

## Ordem de execução

1. Criar e rodar a **migration**
2. Atualizar o **model** Contact
3. Atualizar os **services** (Create e Update)
4. Atualizar o **controller**
5. Testar via API (Postman/Insomnia)
6. Atualizar o **frontend** para usar campos nativos
7. (Opcional) Rodar script de **migração de dados** existentes

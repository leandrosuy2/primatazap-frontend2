import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TextField,
  Paper,
  Typography,
} from "@material-ui/core";
import WhatsApp from "@material-ui/icons/WhatsApp";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/Delete";
import Visibility from "@material-ui/icons/Visibility";
import Share from "@material-ui/icons/Share";
import { format } from "date-fns";
import { Can } from "../../components/Can";
import KanbanChatModal from "./KanbanChatModal";
import QuadroModal from "./QuadroModal";
import NewTicketModal from "../../components/NewTicketModal";
import TagModal from "../../components/TagModal";
import Add from "@material-ui/icons/Add";
import DragIndicator from "@material-ui/icons/DragIndicator";
import Settings from "@material-ui/icons/Settings";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
  },
  dateInput: {
    width: 160,
    "& .MuiInputBase-input": {
      fontSize: "0.875rem",
    },
  },
  btnBuscar: {
    textTransform: "uppercase",
    fontWeight: 600,
  },
  btnAdicionar: {
    textTransform: "uppercase",
    fontWeight: 600,
  },
  columnsWrapper: {
    display: "flex",
    gap: theme.spacing(2),
    overflowX: "auto",
    paddingBottom: theme.spacing(1),
    minHeight: 520,
  },
  column: {
    flex: "0 0 280px",
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.palette.background.default,
    transition: "box-shadow 0.2s, opacity 0.2s",
  },
  columnDragging: {
    opacity: 0.7,
    boxShadow: theme.shadows[8],
  },
  columnDropTarget: {
    boxShadow: `inset 0 0 0 3px ${theme.palette.primary.main}`,
    borderRadius: 8,
  },
  columnHeader: {
    padding: theme.spacing(1.5, 2),
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(1),
  },
  columnHeaderButton: {
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: 500,
    textTransform: "none",
    padding: "2px 6px",
    minWidth: "auto",
    lineHeight: 1.2,
    "& .MuiButton-startIcon": {
      marginRight: 4,
      "& svg": { fontSize: 14 },
    },
    borderColor: "rgba(255,255,255,0.7)",
    "&:hover": {
      borderColor: "#fff",
      backgroundColor: "rgba(255,255,255,0.12)",
    },
  },
  columnHeaderEmAberto: {
    backgroundColor: "#6c757d",
  },
  columnCards: {
    flex: 1,
    padding: theme.spacing(1.5),
    backgroundColor: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    minHeight: 120,
  },
  columnCardsDragOver: {
    backgroundColor: "#e3f2fd",
  },
  card: {
    padding: 0,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    cursor: "grab",
    transition: "box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    },
    "&:active": {
      cursor: "grabbing",
    },
  },
  cardDragging: {
    opacity: 0.85,
    cursor: "grabbing",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  cardHeader: {
    padding: theme.spacing(1.25, 1.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    minHeight: 0,
  },
  cardAvatar: {
    width: 36,
    height: 36,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  cardClientName: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.3,
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardConnection: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardBadgeWrap: {
    flexShrink: 0,
    marginLeft: "auto",
  },
  cardStatus: {
    "& .MuiChip-root": {
      height: 24,
      fontSize: "0.7rem",
      fontWeight: 600,
      color: "#fff",
    },
  },
  cardCapa: {
    width: "100%",
    height: 72,
    objectFit: "cover",
    display: "block",
    backgroundColor: theme.palette.grey[200],
    borderTop: "1px solid",
    borderColor: theme.palette.divider,
  },
  cardBody: {
    padding: theme.spacing(0.75, 1.25),
    borderTop: "1px solid",
    borderColor: theme.palette.divider,
    "& > div": { marginBottom: 4 },
    "& > div:last-child": { marginBottom: 0 },
  },
  cardBodyLine: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardBodyLabel: {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(0.75, 1),
    backgroundColor: theme.palette.grey[50],
    borderTop: "1px solid",
    borderColor: theme.palette.divider,
  },
  cardIconBtn: {
    padding: 8,
    color: theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: "rgba(0,0,0,0.06)",
    },
  },
  cardEditNameBtn: {
    padding: 2,
    marginLeft: 4,
    color: theme.palette.text.secondary,
    opacity: 0,
    transition: "opacity 0.15s",
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
    "&:hover $cardEditNameBtn": {
      opacity: 1,
    },
  },
  inlineNameInput: {
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: "2px 4px",
    border: "1px solid",
    borderColor: theme.palette.primary.main,
    borderRadius: 4,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  },
}));

const LANE_EM_ABERTO = "lane0";

const getContactImageUrl = (contact) => {
  const url = contact?.urlPicture || contact?.profilePicUrl;
  if (!url || typeof url !== "string") return null;
  let resolved = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const base = process.env.REACT_APP_BACKEND_URL || "";
    resolved = base + (url.startsWith("/") ? url : "/" + url);
  }
  return resolved.replace(/:443(?=\/)/, "");
};

// Ícone do card: só foto do contato (WhatsApp primeiro). Nunca usar capa do quadro.
const getAvatarUrlForCard = (ticket) => {
  const contact = ticket?.contact;
  const capa = ticket?.quadroCapaUrl || ticket?.capaUrl;
  const profilePicUrl = contact?.profilePicUrl;
  const urlPicture = contact?.urlPicture;
  let url = profilePicUrl || (urlPicture && (!capa || urlPicture !== capa) ? urlPicture : null);
  if (!url || typeof url !== "string") return null;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const base = process.env.REACT_APP_BACKEND_URL || "";
    url = base + (url.startsWith("/") ? url : "/" + url);
  }
  return url.replace(/:443(?=\/)/, "");
};

// Thumbnail do card: capa do quadro se existir, senão foto do contato
const getCardImageUrl = (ticket) => {
  const capa = ticket?.quadroCapaUrl || ticket?.capaUrl;
  if (capa && typeof capa === "string") {
    let resolved = capa;
    if (!capa.startsWith("http://") && !capa.startsWith("https://")) {
      const base = process.env.REACT_APP_BACKEND_URL || "";
      resolved = base + (capa.startsWith("/") ? capa : "/" + capa);
    }
    return resolved.replace(/:443(?=\/)/, "");
  }
  return getContactImageUrl(ticket?.contact);
};

const LS_KEY = "kanban_custom_statuses";

function loadStatusesFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

function getStatusBadgeColor(laneId, laneTitle, headerColor, statusList) {
  if (laneId === LANE_EM_ABERTO) return "#6c757d";
  const t = (laneTitle || "").toLowerCase();
  if (statusList && statusList.length > 0) {
    const match = statusList.find(
      (s) => s.label?.toLowerCase() === t || s.value?.toLowerCase() === t
    );
    if (match?.color) return match.color;
  }
  if (t.includes("entregue") || t.includes("concluido") || t.includes("concluídos")) return "#2e7d32";
  if (t.includes("produção") || t.includes("producao") || t.includes("criação") || t.includes("criacao")) return "#ed6c02";
  return headerColor || "#d32f2f";
}

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dragOverLaneId, setDragOverLaneId] = useState(null);
  const [draggingTicketId, setDraggingTicketId] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatModalTicketUuid, setChatModalTicketUuid] = useState(null);
  const [quadroModalOpen, setQuadroModalOpen] = useState(false);
  const [quadroModalTicketUuid, setQuadroModalTicketUuid] = useState(null);
  const [quadroModalReadOnly, setQuadroModalReadOnly] = useState(true);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newTicketModalLaneId, setNewTicketModalLaneId] = useState(null);
  const [draggingColumnId, setDraggingColumnId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [editColumnTag, setEditColumnTag] = useState(null);
  const [quadroGroups, setQuadroGroups] = useState([]);
  const [selectedQuadroGroupId, setSelectedQuadroGroupId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalTicket, setShareModalTicket] = useState(null);
  const [shareModalSelectedIds, setShareModalSelectedIds] = useState([]);
  const [shareModalSaving, setShareModalSaving] = useState(false);
  const [editingNameTicketId, setEditingNameTicketId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [customStatuses, setCustomStatuses] = useState([]);
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#1976d2");
  const [editingStatusIdx, setEditingStatusIdx] = useState(null);

  const queueIds = user.queues.map((q) => q.UserQueue.queueId);

  // Carregar status personalizados
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const { data } = await api.get("/quadro-statuses");
        const list = data.statuses || data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCustomStatuses(list.map((s) => ({
            value: s.value || s.label?.toLowerCase().replace(/\s+/g, "_") || "",
            label: s.label || s.name || "",
            color: s.color || "#1976d2",
          })));
          return;
        }
      } catch (err) {}
      const stored = loadStatusesFromStorage();
      if (stored) setCustomStatuses(stored);
    };
    loadStatuses();
  }, []);

  useEffect(() => {
    fetchTags();
  }, [user]);

  useEffect(() => {
    const loadQuadroGroups = async () => {
      try {
        const { data } = await api.get("/quadro-groups");
        const list = data.groups || data.lista || data || [];
        setQuadroGroups(Array.isArray(list) ? list : []);
        if (list.length > 0 && selectedQuadroGroupId == null) {
          setSelectedQuadroGroupId(String(list[0].id));
        }
      } catch (err) {
        setQuadroGroups([
          { id: 1, name: "Produção" },
          { id: 2, name: "Financeiro" },
          { id: 3, name: "Designer" },
        ]);
        if (selectedQuadroGroupId == null) setSelectedQuadroGroupId("1");
      }
    };
    loadQuadroGroups();
  }, []);

  useEffect(() => {
    if (quadroGroups.length > 0 && selectedQuadroGroupId == null) {
      setSelectedQuadroGroupId(String(quadroGroups[0].id));
    }
  }, [quadroGroups]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      setTags(response.data.lista || []);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const params = {
        queueIds: JSON.stringify(queueIds),
        startDate,
        endDate,
      };
      if (selectedQuadroGroupId != null && selectedQuadroGroupId !== "") {
        params.quadroGroupId = selectedQuadroGroupId;
      }
      const { data } = await api.get("/ticket/kanban", { params });
      const list = data.tickets || [];
      console.log("[Kanban fetchTickets] raw count:", list.length, "tickets:", list.map((t) => ({ id: t.id, uuid: t.uuid, contact: t.contact?.name })));
      const seen = new Set();
      const duplicados = [];
      const unicos = list.filter((t) => {
        const key = t.id != null ? t.id : t.uuid;
        if (key == null || seen.has(key)) {
          if (key != null && seen.has(key)) duplicados.push(key);
          return false;
        }
        seen.add(key);
        return true;
      });
      if (duplicados.length) console.log("[Kanban fetchTickets] ids duplicados removidos:", duplicados);
      console.log("[Kanban fetchTickets] após dedup:", unicos.length, "ids:", unicos.map((t) => t.id));
      setTickets(unicos);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    const companyId = user.companyId;
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        fetchTickets();
      }
    };
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);
    return () => {
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket, startDate, endDate]);

  useEffect(() => {
    if (selectedQuadroGroupId != null && tags.length >= 0) fetchTickets();
  }, [selectedQuadroGroupId]);

  const handleStartEditName = (e, ticket) => {
    e.stopPropagation();
    setEditingNameTicketId(ticket.id);
    setEditingNameValue(ticket.contact?.name || "");
  };

  const handleSaveEditName = async (ticketId) => {
    const trimmed = editingNameValue.trim();
    if (!trimmed) {
      setEditingNameTicketId(null);
      return;
    }
    try {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket?.contact?.id) {
        await api.put(`/contacts/${ticket.contact.id}`, { name: trimmed });
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, contact: { ...t.contact, name: trimmed } }
              : t
          )
        );
        toast.success("Nome atualizado.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao salvar nome.");
    }
    setEditingNameTicketId(null);
  };

  const handleCancelEditName = () => {
    setEditingNameTicketId(null);
    setEditingNameValue("");
  };

  const saveStatuses = async (newList) => {
    setCustomStatuses(newList);
    try { localStorage.setItem(LS_KEY, JSON.stringify(newList)); } catch (e) {}
    try { await api.put("/quadro-statuses", { statuses: newList }); } catch (e) {}
  };

  const handleAddStatus = () => {
    const label = newStatusLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (customStatuses.some((s) => s.value === value)) {
      toast.warn("Já existe um status com esse nome.");
      return;
    }
    saveStatuses([...customStatuses, { value, label, color: newStatusColor }]);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
    toast.success(`Status "${label}" criado.`);
  };

  const handleUpdateStatus = (index) => {
    const label = newStatusLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    saveStatuses(customStatuses.map((s, i) =>
      i === index ? { value, label, color: newStatusColor } : s
    ));
    setEditingStatusIdx(null);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
    toast.success("Status atualizado.");
  };

  const handleDeleteStatus = (index) => {
    const s = customStatuses[index];
    if (!window.confirm(`Excluir o status "${s.label}"?`)) return;
    const updated = customStatuses.filter((_, i) => i !== index);
    if (updated.length === 0) {
      toast.warn("É necessário ter pelo menos um status.");
      return;
    }
    saveStatuses(updated);
    toast.success("Status removido.");
  };

  const handleEditStatusStart = (index) => {
    setEditingStatusIdx(index);
    setNewStatusLabel(customStatuses[index].label);
    setNewStatusColor(customStatuses[index].color);
  };

  const handleCancelEditStatus = () => {
    setEditingStatusIdx(null);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
  };

  const handleSearchClick = () => fetchTickets();

  const handleOpenShare = (e, ticket) => {
    e.stopPropagation();
    setShareModalTicket(ticket);
    const shared = ticket.quadroSharedGroupIds || ticket.sharedQuadroGroupIds || [];
    const otherIds = quadroGroups.map((g) => String(g.id)).filter((id) => id !== String(selectedQuadroGroupId));
    setShareModalSelectedIds(shared.map(String).filter((id) => otherIds.includes(id)));
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
    setShareModalTicket(null);
    setShareModalSelectedIds([]);
  };

  const handleShareSave = async () => {
    if (!shareModalTicket?.id) return;
    setShareModalSaving(true);
    try {
      await api.post("/tickets/" + shareModalTicket.id + "/quadro/share", {
        groupIds: shareModalSelectedIds.map(Number).filter((n) => !Number.isNaN(n)),
      });
      toast.success("Compartilhamento atualizado. As outras áreas verão as atualizações deste card.");
      handleCloseShareModal();
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao compartilhar.");
    } finally {
      setShareModalSaving(false);
    }
  };
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleAddColunas = () => history.push("/tagsKanban");

  const handleColumnDragStart = (e, laneId) => {
    if (laneId === LANE_EM_ABERTO) return;
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "column", laneId }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingColumnId(laneId);
  };

  const handleColumnDragOver = (e, laneId) => {
    if (laneId === LANE_EM_ABERTO) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId(laneId);
  };

  const handleColumnDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOverColumnId(null);
  };

  const handleColumnDrop = (e, targetLaneId) => {
    e.preventDefault();
    setDragOverColumnId(null);
    setDraggingColumnId(null);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const { type, laneId: sourceLaneId, ticketId } = data;
      // Se for arrasto de card, mover o card (getData só pode ser lido uma vez, então usamos os dados já parseados)
      if (type !== "column") {
        const cardSourceLaneId = data.sourceLaneId;
        if (ticketId && cardSourceLaneId !== undefined) {
          handleCardMove(ticketId, cardSourceLaneId, targetLaneId);
        }
        setDraggingTicketId(null);
        setDragOverLaneId(null);
        return;
      }
      if (sourceLaneId === LANE_EM_ABERTO || targetLaneId === LANE_EM_ABERTO || sourceLaneId === targetLaneId) return;
      const fromIdx = tags.findIndex((t) => String(t.id) === sourceLaneId);
      const toIdx = tags.findIndex((t) => String(t.id) === targetLaneId);
      if (fromIdx === -1 || toIdx === -1) return;
      const newTags = [...tags];
      const [removed] = newTags.splice(fromIdx, 1);
      newTags.splice(toIdx, 0, removed);
      setTags(newTags);
      toast.success("Ordem das colunas atualizada.");
      try {
        api.put("/tag/kanban/reorder", { tagIds: newTags.map((t) => t.id) }).catch(() => {});
      } catch (err) {}
    } catch (err) {}
  };

  const handleColumnDragEnd = () => {
    setDraggingColumnId(null);
    setDragOverColumnId(null);
  };

  const handleEditColumn = (e, tag) => {
    e.stopPropagation();
    setEditColumnTag(tag);
  };

  const handleCloseTagModal = () => {
    setEditColumnTag(null);
    fetchTags();
  };

  const handleVerQuadro = (uuid) => {
    setQuadroModalTicketUuid(uuid);
    setQuadroModalReadOnly(true);
    setQuadroModalOpen(true);
  };
  const handleWhatsApp = (uuid) => {
    setChatModalTicketUuid(uuid);
    setChatModalOpen(true);
  };

  const handleOpenNewTicketModal = (laneId) => {
    setNewTicketModalLaneId(laneId);
    setNewTicketModalOpen(true);
  };

  const handleCloseNewTicketModal = (ticket) => {
    if (ticket?.id && newTicketModalLaneId && newTicketModalLaneId !== LANE_EM_ABERTO) {
      api
        .put(`/ticket-tags/${ticket.id}/${newTicketModalLaneId}`)
        .then(() => fetchTickets())
        .catch((err) => {
          console.error(err);
          fetchTickets();
        });
    } else if (ticket?.id) {
      fetchTickets();
    }
    setNewTicketModalOpen(false);
    setNewTicketModalLaneId(null);
  };
  const handleEdit = (e, uuid) => {
    e.stopPropagation();
    setQuadroModalTicketUuid(uuid);
    setQuadroModalReadOnly(false);
    setQuadroModalOpen(true);
  };
  const handleDelete = async (e, ticketId) => {
    e.stopPropagation();
    if (!window.confirm(i18n.t("messages.confirmDelete") || "Excluir este ticket?")) return;
    try {
      await api.delete(`/tickets/${ticketId}`);
      toast.success("Ticket removido.");
      fetchTickets();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao excluir.");
    }
  };

  const handleCardMove = async (ticketId, sourceLaneId, targetLaneId) => {
    console.log("[Kanban handleCardMove]", { ticketId, sourceLaneId, targetLaneId });
    if (sourceLaneId === targetLaneId) return;
    const fromLabel = lanes.find((l) => l.id === sourceLaneId)?.title || sourceLaneId;
    const toLabel = lanes.find((l) => l.id === targetLaneId)?.title || targetLaneId;
    try {
      if (targetLaneId === LANE_EM_ABERTO) {
        await api.delete(`/ticket-tags/${ticketId}`);
        toast.success("Tag removida do ticket.");
      } else {
        await api.delete(`/ticket-tags/${ticketId}`);
        await api.put(`/ticket-tags/${ticketId}/${targetLaneId}`);
        toast.success("Ticket movido com sucesso.");
      }
      try {
        await api.post(`/tickets/${ticketId}/quadro/log`, {
          fromLaneId: sourceLaneId,
          toLaneId: targetLaneId,
          fromLabel,
          toLabel,
        });
      } catch (logErr) {
        console.error("Erro ao registrar log de status:", logErr);
        toast.warn("Ticket movido, mas o log de status não foi registrado.");
      }
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Erro ao mover ticket.");
    } finally {
      setDragOverLaneId(null);
      setDraggingTicketId(null);
    }
  };

  const handleDragStart = (e, ticketId, sourceLaneId) => {
    if (e.target.closest("button") || e.target.closest("[data-no-drag]")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ ticketId, sourceLaneId })
    );
    e.dataTransfer.effectAllowed = "move";
    setDraggingTicketId(ticketId);
  };

  const handleDragEnd = () => {
    setDraggingTicketId(null);
    setDragOverLaneId(null);
  };

  const handleDragOver = (e, laneId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverLaneId(laneId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverLaneId(null);
    }
  };

  const handleDrop = (e, targetLaneId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLaneId(null);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.type === "column") {
        handleColumnDrop(e, targetLaneId);
        return;
      }
      const { ticketId, sourceLaneId } = data;
      if (!ticketId) return;
      handleCardMove(ticketId, sourceLaneId, targetLaneId);
    } catch (err) {
      console.error(err);
    }
    setDraggingTicketId(null);
  };

  // Ordem fixa das colunas (tags) para decidir onde o ticket aparece
  const tagIdsOrder = tags.map((t) => String(t.id));
  // Cada ticket em UMA coluna: sem tag = Em aberto; com tag = coluna da última tag (na ordem das colunas), assim o movimento para 3ª/4ª coluna aparece certo
  const getTicketLaneId = (t) => {
    if (!t.tags || t.tags.length === 0) return null;
    let lastIdx = -1;
    let lastId = null;
    for (const tt of t.tags) {
      const id = String(tt.id);
      const idx = tagIdsOrder.indexOf(id);
      if (idx > lastIdx) {
        lastIdx = idx;
        lastId = id;
      }
    }
    return lastId || tagIdsOrder[0];
  };

  const ticketsEmAberto = tickets.filter((t) => getTicketLaneId(t) === null);

  const lanes = [
    {
      id: LANE_EM_ABERTO,
      title: i18n.t("tagsKanban.laneDefault") || "Em aberto",
      headerColor: null,
      tickets: ticketsEmAberto,
      statusLabel: "Em aberto",
    },
    ...tags.map((tag) => ({
      id: String(tag.id),
      title: tag.name,
      headerColor: tag.color || "#1976d2",
      tickets: tickets.filter((t) => getTicketLaneId(t) === String(tag.id)),
      statusLabel: tag.name,
    })),
  ];

  console.log("[Kanban lanes]", lanes.map((l) => ({ id: l.id, title: l.title, count: l.tickets.length, ticketIds: l.tickets.map((t) => t.id) })));

  const otherGroups = quadroGroups.filter((g) => String(g.id) !== String(selectedQuadroGroupId));

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <div className={classes.filters}>
          {quadroGroups.length > 0 && (
            <FormControl variant="outlined" size="small" className={classes.dateInput}>
              <InputLabel>Área</InputLabel>
              <Select
                value={selectedQuadroGroupId ?? ""}
                onChange={(e) => setSelectedQuadroGroupId(e.target.value)}
                label="Área"
              >
                {quadroGroups.map((g) => (
                  <MenuItem key={g.id} value={String(g.id)}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <TextField
            label="Data de início"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            className={classes.dateInput}
            inputProps={{ max: endDate }}
          />
          <TextField
            label="Data de fim"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            className={classes.dateInput}
            inputProps={{ min: startDate }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchClick}
            className={classes.btnBuscar}
          >
            BUSCAR
          </Button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Settings />}
            onClick={() => setStatusManagerOpen(true)}
            style={{ textTransform: "none", fontWeight: 600 }}
          >
            Gerenciar Status
          </Button>
          <Can
            role={user.profile}
            perform="dashboard:view"
            yes={() => (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddColunas}
                className={classes.btnAdicionar}
              >
                + ADICIONAR COLUNAS
              </Button>
            )}
          />
        </div>
      </header>

      <div
        className={classes.columnsWrapper}
        onDragOverCapture={(e) => {
          if (draggingColumnId) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = "move";
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const col = el && el.closest("[data-lane-id]");
          if (col) setDragOverLaneId(col.getAttribute("data-lane-id"));
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOverLaneId(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          const el = document.elementFromPoint(e.clientX, e.clientY);
          const col = el && el.closest("[data-lane-id]");
          const targetLaneId = col ? col.getAttribute("data-lane-id") : null;
          setDragOverLaneId(null);
          console.log("[Kanban drop] clientX:", e.clientX, "clientY:", e.clientY, "el:", el?.className, "col:", col?.getAttribute("data-lane-id"), "targetLaneId:", targetLaneId);
          if (!targetLaneId) return;
          const raw = e.dataTransfer.getData("application/json");
          if (!raw) return;
          try {
            const data = JSON.parse(raw);
            console.log("[Kanban drop] data:", data);
            if (data.type === "column") {
              handleColumnDrop(e, targetLaneId);
              return;
            }
            const { ticketId, sourceLaneId } = data;
            if (ticketId != null && sourceLaneId != null) {
              console.log("[Kanban drop] handleCardMove ticketId:", ticketId, "sourceLaneId:", sourceLaneId, "targetLaneId:", targetLaneId);
              handleCardMove(ticketId, sourceLaneId, targetLaneId);
            }
            setDraggingTicketId(null);
          } catch (err) {
            console.error(err);
          }
        }}
      >
        {lanes.map((lane) => {
          const isTagColumn = lane.id !== LANE_EM_ABERTO;
          const tag = isTagColumn ? tags.find((t) => String(t.id) === lane.id) : null;
          return (
          <div
            key={lane.id}
            data-lane-id={lane.id}
            className={`${classes.column} ${
              draggingColumnId === lane.id ? classes.columnDragging : ""
            } ${dragOverColumnId === lane.id ? classes.columnDropTarget : ""}`}
            onDragOver={isTagColumn ? (e) => handleColumnDragOver(e, lane.id) : undefined}
            onDragLeave={isTagColumn ? handleColumnDragLeave : undefined}
            onDrop={isTagColumn ? (e) => handleColumnDrop(e, lane.id) : undefined}
          >
            <div
              className={`${classes.columnHeader} ${
                lane.id === LANE_EM_ABERTO ? classes.columnHeaderEmAberto : ""
              }`}
              style={lane.headerColor ? { backgroundColor: lane.headerColor } : undefined}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1 }}>
                {isTagColumn && (
                  <span
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, lane.id)}
                    onDragEnd={handleColumnDragEnd}
                    style={{ cursor: "grab", display: "flex", color: "rgba(255,255,255,0.9)" }}
                    title="Arrastar para reordenar"
                  >
                    <DragIndicator style={{ fontSize: 20 }} />
                  </span>
                )}
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{lane.title}</span>
                {isTagColumn && tag && (
                  <IconButton
                    size="small"
                    style={{ color: "rgba(255,255,255,0.9)", padding: 4 }}
                    onClick={(e) => handleEditColumn(e, tag)}
                    title="Editar coluna"
                  >
                    <Edit style={{ fontSize: 18 }} />
                  </IconButton>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{lane.tickets.length}</span>
                <Button
                  variant="outlined"
                  size="small"
                  className={classes.columnHeaderButton}
                  startIcon={<Add style={{ fontSize: 14 }} />}
                  onClick={() => handleOpenNewTicketModal(lane.id)}
                >
                  Adicionar cartão
                </Button>
              </div>
            </div>
            <div
              className={`${classes.columnCards} ${
                dragOverLaneId === lane.id ? classes.columnCardsDragOver : ""
              }`}
              onDragOver={(e) => handleDragOver(e, lane.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, lane.id)}
            >
              {lane.tickets.map((ticket) => (
                <Paper
                  key={ticket.id}
                  elevation={0}
                  className={`${classes.card} ${
                    draggingTicketId === ticket.id ? classes.cardDragging : ""
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ticket.id, lane.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={classes.cardHeader}>
                    <Avatar
                      className={classes.cardAvatar}
                      src={getAvatarUrlForCard(ticket)}
                      alt={ticket.contact?.name}
                    >
                      {(ticket.contact?.name || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <div className={classes.cardHeaderText}>
                      {(ticket.nomeProjeto || ticket.nomeEmpresa || ticket.quadroNomeProjeto) && (
                        <Typography variant="caption" color="textSecondary" noWrap title={ticket.nomeProjeto || ticket.nomeEmpresa || ticket.quadroNomeProjeto}>
                          {ticket.nomeProjeto || ticket.nomeEmpresa || ticket.quadroNomeProjeto}
                        </Typography>
                      )}
                      {editingNameTicketId === ticket.id ? (
                        <input
                          className={classes.inlineNameInput}
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditName(ticket.id);
                            if (e.key === "Escape") handleCancelEditName();
                          }}
                          onBlur={() => handleSaveEditName(ticket.id)}
                          autoFocus
                          data-no-drag
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Typography className={classes.cardClientName} title={ticket.contact?.name}>
                            {ticket.contact?.name || "-"}
                          </Typography>
                          <IconButton
                            size="small"
                            className={classes.cardEditNameBtn}
                            onClick={(e) => handleStartEditName(e, ticket)}
                            title="Editar nome"
                            data-no-drag
                          >
                            <Edit style={{ fontSize: 14 }} />
                          </IconButton>
                        </div>
                      )}
                      {ticket.whatsapp?.name && (
                        <Typography className={classes.cardConnection} title={ticket.whatsapp.name}>
                          {ticket.whatsapp.name}
                        </Typography>
                      )}
                    </div>
                    <div className={classes.cardBadgeWrap}>
                      <Chip
                        size="small"
                        label={lane.statusLabel}
                        className={classes.cardStatus}
                        style={{
                          backgroundColor: getStatusBadgeColor(lane.id, lane.title, lane.headerColor, customStatuses),
                          color: "#fff",
                        }}
                      />
                    </div>
                  </div>
                  {(ticket.quadroCapaUrl || ticket.capaUrl) && (
                    <img
                      src={getCardImageUrl(ticket)}
                      alt="Capa"
                      className={classes.cardCapa}
                    />
                  )}
                  {(ticket.quadroValorServico != null || ticket.quadroValorEntrada != null || (ticket.quadroCustomFields && ticket.quadroCustomFields.length > 0)) && (
                    <div className={classes.cardBody}>
                      {ticket.quadroValorServico != null && (
                        <div className={classes.cardBodyLine}>
                          <span className={classes.cardBodyLabel}>Valor do serviço:</span> R$ {Number(ticket.quadroValorServico).toFixed(2)}
                        </div>
                      )}
                      {ticket.quadroValorEntrada != null && (
                        <div className={classes.cardBodyLine}>
                          <span className={classes.cardBodyLabel}>Entrada:</span> R$ {Number(ticket.quadroValorEntrada).toFixed(2)}
                        </div>
                      )}
                      {(ticket.quadroValorServico != null || ticket.quadroValorEntrada != null) && (
                        <div className={classes.cardBodyLine}>
                          <span className={classes.cardBodyLabel}>Falta pagar:</span> R$ {(Number(ticket.quadroValorServico || 0) - Number(ticket.quadroValorEntrada || 0)).toFixed(2)}
                        </div>
                      )}
                      {ticket.quadroCustomFields && ticket.quadroCustomFields.length > 0 && ticket.quadroCustomFields.map((f, i) => (
                        f.name && (
                          <div key={i} className={classes.cardBodyLine}>
                            <span className={classes.cardBodyLabel}>{f.name}:</span>{" "}
                            {f.type === "link" && (f.value || "").startsWith("http") ? (
                              <a href={f.value} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>{f.value}</a>
                            ) : (
                              (f.value || "-")
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  {(ticket.quadroSharedGroupIds?.length > 0 || ticket.sharedQuadroGroupIds?.length > 0) && (
                    <div style={{ padding: "4px 10px", fontSize: "0.65rem", color: "#666", borderTop: "1px solid #eee" }}>
                      Compartilhado: {(ticket.quadroSharedGroupIds || ticket.sharedQuadroGroupIds || [])
                        .map((id) => quadroGroups.find((g) => String(g.id) === String(id))?.name)
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </div>
                  )}
                  <div className={classes.cardActions} data-no-drag>
                    <IconButton size="small" className={classes.cardIconBtn} onClick={(e) => handleOpenShare(e, ticket)} title="Compartilhar com outras áreas">
                      <Share fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.cardIconBtn} onClick={() => handleVerQuadro(ticket.uuid)} title="Ver Quadro">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.cardIconBtn} onClick={() => handleWhatsApp(ticket.uuid)} title="WhatsApp">
                      <WhatsApp fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.cardIconBtn} onClick={(e) => handleEdit(e, ticket.uuid)} title="Editar">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className={classes.cardIconBtn} onClick={(e) => handleDelete(e, ticket.id)} title="Excluir">
                      <Delete fontSize="small" />
                    </IconButton>
                  </div>
                </Paper>
              ))}
            </div>
          </div>
          );
        })}
      </div>

      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={handleCloseNewTicketModal}
      />

      {editColumnTag && (
        <TagModal
          open={!!editColumnTag}
          onClose={handleCloseTagModal}
          tagId={editColumnTag.id}
          kanban={1}
        />
      )}

      <QuadroModal
        open={quadroModalOpen}
        onClose={() => {
          setQuadroModalOpen(false);
          setQuadroModalTicketUuid(null);
        }}
        ticketUuid={quadroModalTicketUuid}
        readOnly={quadroModalReadOnly}
        onOpenShare={(t) => {
          if (!t) return;
          setShareModalTicket(t);
          const shared = t.quadroSharedGroupIds || t.sharedQuadroGroupIds || [];
          const otherIds = quadroGroups.map((g) => String(g.id)).filter((id) => id !== String(selectedQuadroGroupId));
          setShareModalSelectedIds(shared.map(String).filter((id) => otherIds.includes(id)));
          setShareModalOpen(true);
        }}
      />

      <KanbanChatModal
        open={chatModalOpen}
        onClose={() => {
          setChatModalOpen(false);
          setChatModalTicketUuid(null);
        }}
        ticketUuid={chatModalTicketUuid}
        onVerQuadro={(uuid) => {
          setQuadroModalTicketUuid(uuid);
          setQuadroModalReadOnly(true);
          setQuadroModalOpen(true);
        }}
      />

      <Dialog open={shareModalOpen} onClose={handleCloseShareModal} maxWidth="sm" fullWidth>
        <DialogTitle>Compartilhar com outras áreas</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Este card aparecerá nas áreas marcadas. Alterações (status, valores, campos) feitas aqui serão vistas lá também.
          </Typography>
          {otherGroups.length === 0 ? (
            <Typography variant="body2" color="textSecondary">Não há outras áreas configuradas.</Typography>
          ) : (
            <div>
              {otherGroups.map((g) => (
                <FormControlLabel
                  key={g.id}
                  control={
                    <Checkbox
                      checked={shareModalSelectedIds.includes(String(g.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShareModalSelectedIds((prev) => [...prev, String(g.id)]);
                        } else {
                          setShareModalSelectedIds((prev) => prev.filter((id) => id !== String(g.id)));
                        }
                      }}
                    />
                  }
                  label={g.name}
                />
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareModal}>Cancelar</Button>
          <Button onClick={handleShareSave} color="primary" variant="contained" disabled={shareModalSaving}>
            {shareModalSaving ? "Salvando…" : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gerenciador de Status Personalizados */}
      <Dialog
        open={statusManagerOpen}
        onClose={() => { setStatusManagerOpen(false); handleCancelEditStatus(); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings fontSize="small" />
            Gerenciar Status Personalizados
          </div>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Crie, edite ou remova status para adaptar o quadro ao seu processo de trabalho.
          </Typography>

          {customStatuses.length === 0 && (
            <Paper variant="outlined" style={{ padding: 16, marginBottom: 16, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                Nenhum status personalizado criado ainda. Os status padrão estão sendo usados (Entregue, Em produção, Aguardando, Cancelado).
              </Typography>
            </Paper>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {customStatuses.map((s, idx) => (
              <Paper
                key={s.value + idx}
                variant="outlined"
                style={{
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: s.color,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: s.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" style={{ flex: 1, fontWeight: 500 }}>
                  {s.label}
                </Typography>
                <Typography variant="caption" color="textSecondary" style={{ marginRight: 8 }}>
                  {s.value}
                </Typography>
                <IconButton size="small" onClick={() => handleEditStatusStart(idx)} title="Editar">
                  <Edit style={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteStatus(idx)} title="Excluir" style={{ color: "#d32f2f" }}>
                  <Delete style={{ fontSize: 16 }} />
                </IconButton>
              </Paper>
            ))}
          </div>

          <Paper
            variant="outlined"
            style={{
              padding: 16,
              backgroundColor: editingStatusIdx !== null ? "#fff3e0" : "#f5f5f5",
              borderRadius: 8,
            }}
          >
            <Typography variant="subtitle2" style={{ marginBottom: 10 }}>
              {editingStatusIdx !== null ? "Editar status" : "Adicionar novo status"}
            </Typography>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <TextField
                size="small"
                variant="outlined"
                label="Nome do status"
                placeholder="Ex.: Em revisão"
                value={newStatusLabel}
                onChange={(e) => setNewStatusLabel(e.target.value)}
                style={{ flex: 1, minWidth: 180 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editingStatusIdx !== null
                      ? handleUpdateStatus(editingStatusIdx)
                      : handleAddStatus();
                  }
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Typography variant="caption" color="textSecondary">Cor:</Typography>
                <input
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                    cursor: "pointer",
                    padding: 2,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["#2e7d32", "#ed6c02", "#1976d2", "#757575", "#d32f2f", "#9c27b0", "#00838f", "#e91e63"].map((c) => (
                  <div
                    key={c}
                    onClick={() => setNewStatusColor(c)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      backgroundColor: c,
                      cursor: "pointer",
                      border: newStatusColor === c ? "2px solid #000" : "2px solid transparent",
                      transition: "border 0.15s",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {editingStatusIdx !== null ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleUpdateStatus(editingStatusIdx)}
                    disabled={!newStatusLabel.trim()}
                  >
                    Salvar alteração
                  </Button>
                  <Button size="small" onClick={handleCancelEditStatus}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<Add />}
                  onClick={handleAddStatus}
                  disabled={!newStatusLabel.trim()}
                >
                  Adicionar status
                </Button>
              )}
            </div>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setStatusManagerOpen(false); handleCancelEditStatus(); }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Kanban;

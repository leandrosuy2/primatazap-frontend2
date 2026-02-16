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
  IconButton,
  TextField,
  Paper,
  Typography,
} from "@material-ui/core";
import WhatsApp from "@material-ui/icons/WhatsApp";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/Delete";
import Visibility from "@material-ui/icons/Visibility";
import { format } from "date-fns";
import { Can } from "../../components/Can";
import KanbanChatModal from "./KanbanChatModal";
import QuadroModal from "./QuadroModal";
import NewTicketModal from "../../components/NewTicketModal";
import Add from "@material-ui/icons/Add";

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
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
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
  // Corrige URL com porto duplicado (ex: localhost:4000:443)
  return resolved.replace(/:443(?=\/)/, "");
};

// Cores do badge por status: vermelho=urgente, laranja=produção, verde=entregue
function getStatusBadgeColor(laneId, laneTitle, headerColor) {
  if (laneId === LANE_EM_ABERTO) return "#6c757d";
  const t = (laneTitle || "").toLowerCase();
  if (t.includes("entregue") || t.includes("concluido") || t.includes("concluídos")) return "#2e7d32";
  if (t.includes("produção") || t.includes("producao") || t.includes("criação") || t.includes("criacao")) return "#ed6c02";
  return "#d32f2f"; // urgente/problema
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
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newTicketModalLaneId, setNewTicketModalLaneId] = useState(null);

  const queueIds = user.queues.map((q) => q.UserQueue.queueId);

  useEffect(() => {
    fetchTags();
  }, [user]);

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
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          startDate,
          endDate,
        },
      });
      setTickets(data.tickets || []);
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

  const handleSearchClick = () => fetchTickets();
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleAddColunas = () => history.push("/tagsKanban");

  const handleVerQuadro = (uuid) => {
    setQuadroModalTicketUuid(uuid);
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
    if (sourceLaneId === targetLaneId) return;
    const fromLabel = lanes.find((l) => l.id === sourceLaneId)?.title || sourceLaneId;
    const toLabel = lanes.find((l) => l.id === targetLaneId)?.title || targetLaneId;
    try {
      if (targetLaneId === LANE_EM_ABERTO) {
        await api.delete(`/ticket-tags/${ticketId}`);
        toast.success("Tag removida do ticket.");
      } else {
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
        // Log opcional; não bloqueia
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
    setDragOverLaneId(null);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const { ticketId, sourceLaneId } = JSON.parse(raw);
      handleCardMove(ticketId, sourceLaneId, targetLaneId);
    } catch (err) {
      console.error(err);
    }
    setDraggingTicketId(null);
  };

  const ticketsEmAberto = tickets.filter((t) => !t.tags || t.tags.length === 0);

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
      tickets: tickets.filter((t) => t.tags && t.tags.some((tt) => tt.id === tag.id)),
      statusLabel: tag.name,
    })),
  ];

  return (
    <div className={classes.root}>
      <header className={classes.header}>
        <div className={classes.filters}>
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
      </header>

      <div className={classes.columnsWrapper}>
        {lanes.map((lane) => (
          <div key={lane.id} className={classes.column}>
            <div
              className={`${classes.columnHeader} ${
                lane.id === LANE_EM_ABERTO ? classes.columnHeaderEmAberto : ""
              }`}
              style={lane.headerColor ? { backgroundColor: lane.headerColor } : undefined}
            >
              <span>{lane.title}</span>
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
                      src={getContactImageUrl(ticket.contact)}
                      alt={ticket.contact?.name}
                    >
                      {(ticket.contact?.name || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <div className={classes.cardHeaderText}>
                      <Typography className={classes.cardClientName} title={ticket.contact?.name}>
                        {ticket.contact?.name || "-"}
                      </Typography>
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
                          backgroundColor: getStatusBadgeColor(lane.id, lane.title, lane.headerColor),
                          color: "#fff",
                        }}
                      />
                    </div>
                  </div>
                  <div className={classes.cardActions} data-no-drag>
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
        ))}
      </div>

      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={handleCloseNewTicketModal}
      />

      <QuadroModal
        open={quadroModalOpen}
        onClose={() => {
          setQuadroModalOpen(false);
          setQuadroModalTicketUuid(null);
        }}
        ticketUuid={quadroModalTicketUuid}
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
          setQuadroModalOpen(true);
        }}
      />
    </div>
  );
};

export default Kanban;

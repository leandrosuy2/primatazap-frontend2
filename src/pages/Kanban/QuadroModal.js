import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Close from "@material-ui/icons/Close";
import Refresh from "@material-ui/icons/Refresh";
import Edit from "@material-ui/icons/Edit";
import PersonAdd from "@material-ui/icons/PersonAdd";
import HelpOutline from "@material-ui/icons/HelpOutline";
import Save from "@material-ui/icons/Save";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Link from "@material-ui/icons/Link";
import Image from "@material-ui/icons/Image";
import FormatListBulleted from "@material-ui/icons/FormatListBulleted";
import Add from "@material-ui/icons/Add";
import AttachFile from "@material-ui/icons/AttachFile";
import Delete from "@material-ui/icons/Delete";
import Share from "@material-ui/icons/Share";
import History from "@material-ui/icons/History";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      maxWidth: 900,
      width: "100%",
      maxHeight: "95vh",
      borderRadius: 12,
    },
  },
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: theme.spacing(1),
  },
  dialogContent: {
    overflowY: "auto",
    padding: theme.spacing(2),
  },
  coverWrapper: {
    width: "100%",
    maxHeight: 240,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: theme.palette.grey[200],
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverPlaceholder: {
    padding: theme.spacing(3),
    color: theme.palette.text.secondary,
    textAlign: "center",
    fontSize: "0.9rem",
  },
  statusSelect: { minWidth: 160 },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
  },
  editorCard: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid",
    borderColor: theme.palette.divider,
    marginBottom: theme.spacing(1),
  },
  editorArea: {
    minHeight: 100,
    padding: theme.spacing(2),
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderRadius: 4,
    outline: "none",
    "&:focus": { borderColor: theme.palette.primary.main },
    "& ul": { margin: "8px 0", paddingLeft: 24 },
    "& p": { margin: "4px 0" },
  },
  editorButtons: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    flexWrap: "wrap",
  },
  attachmentsSection: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  attachmentItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5),
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderRadius: 8,
    marginBottom: theme.spacing(1),
  },
  attachmentCapa: {
    fontSize: "0.7rem",
    marginLeft: 8,
    padding: "2px 6px",
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  logsSection: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  timeline: {
    position: "relative",
    paddingLeft: 28,
    "&::before": {
      content: '""',
      position: "absolute",
      left: 7,
      top: 8,
      bottom: 8,
      width: 2,
      background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
      borderRadius: 1,
      transformOrigin: "top",
      animation: "$timelineLineDraw 0.6s ease-out forwards",
    },
  },
  timelineRunner: {
    position: "absolute",
    left: 2,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: `radial-gradient(circle at 30% 30%, #fff, ${theme.palette.primary.light})`,
    boxShadow: "0 0 14px rgba(25, 118, 210, 0.9), 0 0 6px rgba(255,255,255,0.8)",
    transition: "top 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
    zIndex: 1,
  },
  timelineItem: {
    position: "relative",
    marginBottom: theme.spacing(1.5),
    opacity: 0,
    animation: "$timelineSlideIn 0.45s ease-out forwards",
    "&:last-child": { marginBottom: 0 },
  },
  timelineDot: {
    position: "absolute",
    left: -28,
    top: 10,
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "3px solid",
    borderColor: theme.palette.background.paper,
    boxShadow: theme.shadows[2],
    animation: "$timelineDotPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, $timelineDotPulse 2.5s ease-in-out infinite 0.5s",
  },
  timelineCard: {
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: theme.palette.grey[50],
    border: "1px solid",
    borderColor: theme.palette.divider,
    borderLeftWidth: 3,
    transition: "box-shadow 0.25s ease, transform 0.25s ease",
    "&:hover": {
      boxShadow: theme.shadows[3],
      transform: "translateX(6px)",
    },
  },
  timelineTime: {
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: 4,
    letterSpacing: "0.02em",
  },
  timelineLabel: {
    fontSize: "0.9rem",
    color: theme.palette.text.primary,
    "& span": {
      color: theme.palette.text.secondary,
      fontWeight: 500,
    },
  },
  timelineUser: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: 6,
    fontStyle: "italic",
  },
  "@keyframes timelineLineDraw": {
    "0%": { transform: "scaleY(0)" },
    "100%": { transform: "scaleY(1)" },
  },
  "@keyframes timelineSlideIn": {
    "0%": { opacity: 0, transform: "translateX(-24px)" },
    "100%": { opacity: 1, transform: "translateX(0)" },
  },
  "@keyframes timelineDotPop": {
    "0%": { transform: "scale(0)", opacity: 0 },
    "70%": { transform: "scale(1.25)", opacity: 1 },
    "100%": { transform: "scale(1)", opacity: 1 },
  },
  "@keyframes timelineDotPulse": {
    "0%, 100%": { opacity: 1, filter: "brightness(1)" },
    "50%": { opacity: 0.85, filter: "brightness(1.15)" },
  },
  addAttachmentBtn: { marginTop: theme.spacing(1) },
  inputFile: { display: "none" },
  changeClientRow: { marginBottom: theme.spacing(2) },
  changeClientAutocomplete: { minWidth: 280 },
}));

const STATUS_OPTIONS = [
  { value: "entregue", label: "Entregue" },
  { value: "em_producao", label: "Em produção" },
  { value: "aguardando", label: "Aguardando" },
  { value: "cancelado", label: "Cancelado" },
];

// Cores por status para a timeline: entregue=verde, produção=laranja, cancelado=cinza, aberto/aguardando=azul
function getStatusColor(label) {
  if (!label) return "#1976d2";
  const t = String(label).toLowerCase();
  if (t.includes("entregue") || t.includes("concluído") || t.includes("concluido")) return "#2e7d32";
  if (t.includes("produção") || t.includes("producao") || t.includes("criação") || t.includes("criacao")) return "#ed6c02";
  if (t.includes("cancelado")) return "#757575";
  if (t.includes("em aberto") || t.includes("aguardando")) return "#1976d2";
  return "#d32f2f";
}

export default function QuadroModal({ open, onClose, ticketUuid, readOnly = true, onOpenShare }) {
  const classes = useStyles();
  useContext(AuthContext);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const timelineRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("aguardando");
  const [coverImage, setCoverImage] = useState(null);
  const [description, setDescription] = useState("");
  const [descriptionBackup, setDescriptionBackup] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [statusLogs, setStatusLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [changeClientOpen, setChangeClientOpen] = useState(false);
  const [contactOptions, setContactOptions] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedNewContact, setSelectedNewContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [runnerTop, setRunnerTop] = useState(null);
  const [valorServico, setValorServico] = useState(0);
  const [valorEntrada, setValorEntrada] = useState(0);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [customFields, setCustomFields] = useState([]);

  const resolveImageUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    let resolved = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const base = process.env.REACT_APP_BACKEND_URL || "";
      resolved = base + (url.startsWith("/") ? url : "/" + url);
    }
    // Corrige URL vinda do backend com porto duplicado (ex: localhost:4000:443)
    return resolved.replace(/:443(?=\/)/, "");
  };

  const loadAll = React.useCallback(async () => {
    if (!ticketUuid) return;
    try {
      const { data: ticketData } = await api.get("/tickets/u/" + ticketUuid);
      setTicket(ticketData);
      let quadroStatus = "aguardando";
      let quadroDescription = "";
      let quadroAttachments = [];
      try {
        const { data: quadroData } = await api.get("/tickets/" + ticketUuid + "/quadro");
        if (quadroData.quadro) {
          quadroStatus = quadroData.quadro.status || "aguardando";
          quadroDescription = quadroData.quadro.description || "";
          setValorServico(Number(quadroData.quadro.valorServico) || 0);
          setValorEntrada(Number(quadroData.quadro.valorEntrada) || 0);
          setNomeProjeto(quadroData.quadro.nomeProjeto || quadroData.quadro.nomeEmpresa || "");
          const cf = quadroData.quadro.customFields;
          setCustomFields(Array.isArray(cf) ? cf.map((f) => ({ name: f.name || "", value: f.value || "", type: f.type || "text" })) : []);
        } else {
          setValorServico(0);
          setValorEntrada(0);
          setNomeProjeto("");
          setCustomFields([]);
        }
        if (Array.isArray(quadroData.attachments)) {
          quadroAttachments = quadroData.attachments.map((a) => ({
            id: a.id,
            name: a.name,
            url: a.url,
            isCapa: !!a.isCapa,
            createdAt: a.createdAt,
            date: a.createdAt ? format(parseISO(a.createdAt), "dd/MM/yyyy") : "",
          }));
        }
      } catch (quadroErr) {
        // Backend pode ainda não ter o endpoint; mantém defaults
      }
      setStatus(quadroStatus);
      setDescription(quadroDescription || "");
      setAttachments(quadroAttachments);
      const capaAttachment = quadroAttachments.find((a) => a.isCapa);
      if (capaAttachment?.url) {
        setCoverImage(resolveImageUrl(capaAttachment.url));
      } else {
        const pic = ticketData.contact?.urlPicture || ticketData.contact?.profilePicUrl || null;
        setCoverImage(resolveImageUrl(pic));
      }
      // Logs de status: só após ter ticket.id
      const ticketId = ticketData.id;
      if (ticketId) {
        try {
          const { data: logsData } = await api.get(`/tickets/${ticketId}/quadro/logs`);
          setStatusLogs(logsData.logs || []);
        } catch (logErr) {
          setStatusLogs([]);
        }
      }
    } catch (err) {
      toast.error("Ticket não encontrado.");
      onClose();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ticketUuid, onClose]);

  useEffect(() => {
    if (!open || !ticketUuid) {
      setTicket(null);
      setCoverImage(null);
      setStatus("aguardando");
      setDescription("");
      setAttachments([]);
      setStatusLogs([]);
      setValorServico(0);
      setValorEntrada(0);
      setNomeProjeto("");
      setCustomFields([]);
      setEditMode(false);
      setChangeClientOpen(false);
      setRunnerTop(null);
      return;
    }
    setLoading(true);
    loadAll();
  }, [open, ticketUuid, onClose, loadAll]);

  // Runner: vai de um ponto ao próximo na timeline (mede posições dos dots e anima com transition)
  useEffect(() => {
    if (!statusLogs.length || !open) {
      setRunnerTop(null);
      return;
    }
    const DOT_OFFSET = 10; // top do dot dentro do item
    const MS_PER_DOT = 650; // tempo entre cada ponto
    const t = setTimeout(() => {
      const el = timelineRef.current;
      if (!el) return;
      const items = el.querySelectorAll("[data-timeline-item]");
      if (items.length === 0) return;
      const positions = Array.from(items).map((item) => item.offsetTop + DOT_OFFSET);
      setRunnerTop(positions[0]);
      positions.slice(1).forEach((top, i) => {
        setTimeout(() => setRunnerTop(top), (i + 1) * MS_PER_DOT);
      });
    }, 400); // espera linha desenhar + itens começarem a entrar
    return () => clearTimeout(t);
  }, [statusLogs, open]);

  const handleAtualizar = () => {
    setRefreshing(true);
    loadAll();
  };

  const handleEditClick = () => {
    setDescriptionBackup(description);
    setEditMode(true);
    setTimeout(() => {
      if (editorRef.current) editorRef.current.innerHTML = description;
    }, 0);
  };

  const handleSave = async () => {
    const newDescription = editorRef.current?.innerHTML ?? description;
    setDescription(newDescription);
    setEditMode(false);
    if (!ticket?.id) return;
    try {
      await api.put("/tickets/" + ticket.id + "/quadro/description", { description: newDescription });
      toast.success("Descrição salva.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao salvar descrição.");
    }
  };

  const handleDiscard = () => {
    setDescription(descriptionBackup);
    if (editorRef.current) editorRef.current.innerHTML = descriptionBackup;
    setEditMode(false);
    toast.info("Alterações descartadas.");
  };

  const execCmd = (cmd, value = null) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleInsertImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => execCmd("insertImage", reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInsertLink = () => {
    const url = window.prompt("URL do link:");
    if (url) execCmd("createLink", url);
  };

  const handleAddAttachment = async (e) => {
    const files = e.target.files;
    if (!files?.length || !ticket?.id) return;
    const wasEmpty = attachments.length === 0;
    for (const file of Array.from(files)) {
      try {
        const form = new FormData();
        form.append("file", file);
        const { data } = await api.post("/tickets/" + ticket.id + "/quadro/attachments", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const att = data.attachment || data;
        const newAtt = {
          id: att.id,
          name: att.name,
          url: att.url,
          isCapa: att.isCapa !== undefined ? !!att.isCapa : (wasEmpty && file === files[0]),
          createdAt: att.createdAt,
          date: att.createdAt ? format(parseISO(att.createdAt), "dd/MM/yyyy") : "",
        };
        setAttachments((prev) => [...prev, newAtt]);
        if (newAtt.isCapa && newAtt.url) setCoverImage(resolveImageUrl(newAtt.url));
        toast.success("Arquivo adicionado.");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Erro ao enviar " + file.name);
      }
    }
    e.target.value = "";
  };

  const setAsCapa = async (id) => {
    if (!ticket?.id) return;
    try {
      await api.patch("/tickets/" + ticket.id + "/quadro/attachments/" + id + "/capa");
      const att = attachments.find((a) => a.id === id);
      setAttachments((prev) => prev.map((a) => ({ ...a, isCapa: a.id === id })));
      if (att?.url) setCoverImage(resolveImageUrl(att.url));
      toast.success("Capa atualizada.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao marcar capa.");
    }
  };

  const handleDeleteAttachment = async (id) => {
    if (!ticket?.id) return;
    try {
      await api.delete("/tickets/" + ticket.id + "/quadro/attachments/" + id);
      const deleted = attachments.find((a) => a.id === id);
      const remaining = attachments.filter((a) => a.id !== id);
      setAttachments(remaining);
      if (deleted?.isCapa) {
        const next = remaining[0];
        setCoverImage(next?.url ? resolveImageUrl(next.url) : resolveImageUrl(ticket.contact?.urlPicture || ticket.contact?.profilePicUrl));
      }
      toast.success("Anexo excluído.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao excluir.");
    }
  };

  const handleSaveValores = async () => {
    if (!ticket?.id) return;
    try {
      const payload = {
        valorServico,
        valorEntrada,
        nomeProjeto: nomeProjeto || undefined,
        customFields: customFields.filter((f) => (f.name || "").trim()).map((f) => ({ name: (f.name || "").trim(), value: (f.value || "").trim(), type: f.type || "text" })),
      };
      await api.put("/tickets/" + ticket.id + "/quadro", payload);
      toast.success("Valores, nome e campos salvos.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao salvar.");
    }
  };

  const addCustomField = () => setCustomFields((prev) => [...prev, { name: "", value: "", type: "text" }]);
  const updateCustomField = (index, field, key, value) => {
    setCustomFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };
  const removeCustomField = (index) => setCustomFields((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (!readOnly && changeClientOpen && contactSearch.length >= 2) {
      const t = setTimeout(async () => {
        setLoadingContact(true);
        try {
          const { data } = await api.get("contacts", { params: { searchParam: contactSearch } });
          setContactOptions(data.contacts || []);
        } catch (err) {
          setContactOptions([]);
        } finally {
          setLoadingContact(false);
        }
      }, 400);
      return () => clearTimeout(t);
    } else {
      setContactOptions([]);
    }
  }, [readOnly, changeClientOpen, contactSearch]);

  const handleTrocarCliente = async () => {
    if (!selectedNewContact?.id || !ticket?.id) return;
    try {
      await api.put(`/tickets/${ticket.id}/contact`, { contactId: selectedNewContact.id });
      toast.success("Cliente alterado.");
      setTicket((prev) => (prev ? { ...prev, contact: selectedNewContact } : null));
      const newPic = selectedNewContact.urlPicture || selectedNewContact.profilePicUrl || null;
      setCoverImage(resolveImageUrl(newPic));
      setChangeClientOpen(false);
      setSelectedNewContact(null);
      setContactSearch("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao trocar cliente.");
    }
  };

  const contactName = ticket?.contact?.name || "";
  const queueName = ticket?.queue?.name || "";
  const whatsappName = ticket?.whatsapp?.name || "";
  const assignedUser = ticket?.user?.name || "";

  return (
    <Dialog open={open} onClose={onClose} className={classes.dialog} maxWidth={false}>
      <DialogTitle disableTypography className={classes.dialogTitle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {contactName && (
            <Typography variant="subtitle1" noWrap style={{ fontWeight: 600, maxWidth: 280 }}>
              {contactName}
            </Typography>
          )}
          {!readOnly && (
            <Tooltip title="Trocar cliente vinculado">
              <IconButton size="small" onClick={() => setChangeClientOpen((v) => !v)}>
                <PersonAdd fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {queueName && (
            <Typography variant="caption" color="textSecondary">
              {queueName}
              {whatsappName ? ` · ${whatsappName}` : ""}
              {assignedUser ? ` · ${assignedUser}` : ""}
            </Typography>
          )}
          {readOnly ? (
            <Typography variant="body2" color="textSecondary" style={{ marginLeft: 8 }}>
              Status: <strong>{STATUS_OPTIONS.find((o) => o.value === status)?.label || status}</strong>
            </Typography>
          ) : (
            <FormControl variant="outlined" size="small" className={classes.statusSelect}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={async (e) => {
                  const v = e.target.value;
                  setStatus(v);
                  if (!ticket?.id) return;
                  try {
                    await api.put("/tickets/" + ticket.id + "/quadro/status", { status: v });
                    toast.success("Status atualizado.");
                  } catch (err) {
                    setStatus(status);
                    toast.error(err?.response?.data?.message || "Erro ao atualizar status.");
                  }
                }}
                label="Status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        {readOnly && (
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={handleAtualizar}
            disabled={loading || refreshing}
            style={{ marginRight: 8 }}
          >
            {refreshing ? "Atualizando…" : "Atualizar"}
          </Button>
        )}
        {onOpenShare && ticket && (
          <Tooltip title="Compartilhar com outras áreas (Financeiro, Designer, etc.)">
            <Button size="small" startIcon={<Share />} onClick={() => onOpenShare(ticket)} style={{ marginRight: 8 }}>
              Compartilhar
            </Button>
          </Tooltip>
        )}
        <IconButton onClick={onClose} size="small" aria-label="Fechar">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Typography color="textSecondary">Carregando...</Typography>
        ) : (
          <>
            {!readOnly && changeClientOpen && (
              <Paper variant="outlined" className={classes.changeClientRow} style={{ padding: 16 }}>
                <Typography variant="subtitle2" style={{ marginBottom: 8 }}>Trocar cliente</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Autocomplete
                    className={classes.changeClientAutocomplete}
                    options={contactOptions}
                    getOptionLabel={(opt) => (opt.name ? `${opt.name} - ${opt.number || ""}` : "")}
                    loading={loadingContact}
                    value={selectedNewContact}
                    onChange={(_, v) => setSelectedNewContact(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Buscar contato (mín. 2 letras)"
                        variant="outlined"
                        onChange={(e) => setContactSearch(e.target.value)}
                      />
                    )}
                  />
                  <Button variant="contained" color="primary" size="small" disabled={!selectedNewContact} onClick={handleTrocarCliente}>
                    Aplicar
                  </Button>
                  <Button size="small" onClick={() => setChangeClientOpen(false)}>Cancelar</Button>
                </div>
              </Paper>
            )}

            <div className={classes.coverWrapper}>
              {coverImage ? (
                <img src={coverImage} alt="Capa" className={classes.coverImage} />
              ) : (
                <Typography className={classes.coverPlaceholder}>
                  Imagem de capa (arte do produto)
                </Typography>
              )}
            </div>

            <Paper elevation={0} className={classes.editorCard}>
              {readOnly ? (
                <>
                  <Typography variant="subtitle2" color="textSecondary" style={{ marginBottom: 8 }}>Descrição</Typography>
                  <Box style={{ minHeight: 24, padding: 16 }} dangerouslySetInnerHTML={{ __html: description || "" }} />
                </>
              ) : !editMode ? (
                <>
                  <div className={classes.actionsRow}>
                    <Tooltip title="Editar descrição">
                      <IconButton size="small" onClick={handleEditClick}><Edit /></IconButton>
                    </Tooltip>
                    <Tooltip title="Ajuda">
                      <IconButton size="small"><HelpOutline /></IconButton>
                    </Tooltip>
                  </div>
                  <Box onClick={handleEditClick} style={{ cursor: "pointer", minHeight: 50, padding: 16 }} dangerouslySetInnerHTML={{ __html: description || "" }} />
                </>
              ) : (
                <>
                  <div className={classes.toolbar}>
                    <Select size="small" value="" displayEmpty style={{ minWidth: 48, height: 32 }} onMouseDown={(e) => e.preventDefault()} onChange={(e) => execCmd("fontSize", e.target.value)}>
                      <MenuItem value="1">P</MenuItem>
                      <MenuItem value="3">Tt</MenuItem>
                      <MenuItem value="5">H</MenuItem>
                    </Select>
                    <IconButton size="small" onClick={() => execCmd("bold")} title="Negrito"><Typography style={{ fontWeight: 700 }}>B</Typography></IconButton>
                    <IconButton size="small" onClick={() => execCmd("italic")} title="Itálico"><Typography style={{ fontStyle: "italic" }}>I</Typography></IconButton>
                    <IconButton size="small" onClick={() => execCmd("insertUnorderedList")} title="Lista"><FormatListBulleted fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={handleInsertLink} title="Link"><Link fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => imageInputRef.current?.click()} title="Inserir imagem"><Image fontSize="small" /></IconButton>
                    <input type="file" ref={imageInputRef} accept="image/*" className={classes.inputFile} onChange={handleInsertImage} />
                  </div>
                  <div ref={editorRef} className={classes.editorArea} contentEditable suppressContentEditableWarning />
                  <div className={classes.editorButtons}>
                    <Button variant="contained" color="primary" size="small" startIcon={<Save />} onClick={handleSave}>Salvar</Button>
                    <Button variant="outlined" size="small" startIcon={<DeleteOutline />} onClick={handleDiscard}>Descartar alterações</Button>
                    <Button size="small" startIcon={<HelpOutline />}>Ajuda para formatação</Button>
                  </div>
                </>
              )}
            </Paper>

            <Paper elevation={0} style={{ padding: 16, marginBottom: 16 }}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>Nome do Projeto / Empresa</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Ex.: Placa RF Personalizados"
                value={nomeProjeto || ""}
                onChange={(e) => setNomeProjeto(e.target.value)}
                disabled={readOnly}
                style={{ marginBottom: 16 }}
              />
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>Valores</Typography>
              <Box display="flex" flexWrap="wrap" alignItems="center" gridGap={16}>
                <TextField
                  type="number"
                  label="Valor do Serviço"
                  value={valorServico || ""}
                  onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                  size="small"
                  style={{ width: 140 }}
                  disabled={readOnly}
                />
                <TextField
                  type="number"
                  label="Valor de Entrada"
                  value={valorEntrada || ""}
                  onChange={(e) => setValorEntrada(parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 0.01 }}
                  size="small"
                  style={{ width: 140 }}
                  disabled={readOnly}
                />
                <Typography variant="body1" style={{ fontWeight: 600 }}>
                  Falta o cliente pagar: R$ {(Number(valorServico) - Number(valorEntrada)).toFixed(2)}
                </Typography>
                {!readOnly && (
                  <Button variant="outlined" size="small" startIcon={<Save />} onClick={handleSaveValores}>
                    Salvar valores, nome e campos
                  </Button>
                )}
              </Box>
            </Paper>

            <Paper elevation={0} style={{ padding: 16, marginBottom: 16 }}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>Campos personalizados</Typography>
              <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 12 }}>
                Ex.: Nome da fonte, Nome da lente, Endereço, links, etc.
              </Typography>
              {customFields.map((field, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} flexWrap="wrap" style={{ marginBottom: 8 }}>
                  <TextField
                    size="small"
                    placeholder="Nome do campo (ex: Nome da fonte)"
                    value={field.name}
                    onChange={(e) => updateCustomField(index, field, "name", e.target.value)}
                    disabled={readOnly}
                    style={{ minWidth: 160 }}
                  />
                  <TextField
                    size="small"
                    placeholder={field.type === "link" ? "URL (https://...)" : "Valor"}
                    value={field.value}
                    onChange={(e) => updateCustomField(index, field, "value", e.target.value)}
                    disabled={readOnly}
                    style={{ flex: 1, minWidth: 120 }}
                  />
                  {!readOnly && (
                    <>
                      <FormControl size="small" style={{ minWidth: 90 }}>
                        <Select
                          value={field.type || "text"}
                          onChange={(e) => updateCustomField(index, field, "type", e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="text">Texto</MenuItem>
                          <MenuItem value="link">Link</MenuItem>
                        </Select>
                      </FormControl>
                      <IconButton size="small" onClick={() => removeCustomField(index)} color="secondary" title="Remover campo">
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
              ))}
              {!readOnly && (
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={addCustomField} style={{ marginTop: 8 }}>
                  Adicionar campo
                </Button>
              )}
              {customFields.length > 0 && !readOnly && (
                <Button variant="outlined" size="small" startIcon={<Save />} onClick={handleSaveValores} style={{ marginLeft: 8, marginTop: 8 }}>
                  Salvar campos
                </Button>
              )}
            </Paper>

            <Paper elevation={0} className={classes.attachmentsSection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>Anexos</Typography>
              {attachments.map((att) => (
                <div key={att.id} className={classes.attachmentItem}>
                  <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <AttachFile fontSize="small" style={{ marginRight: 8, color: "#666" }} />
                    {att.url ? (
                      <Typography noWrap component="a" href={resolveImageUrl(att.url)} target="_blank" rel="noopener noreferrer" style={{ flex: 1, color: "inherit", textDecoration: "none" }}>
                        {att.name}
                      </Typography>
                    ) : (
                      <Typography noWrap style={{ flex: 1 }}>{att.name}</Typography>
                    )}
                    {att.isCapa && <span className={classes.attachmentCapa}>Capa</span>}
                  </div>
                  <Typography variant="caption" color="textSecondary" style={{ marginRight: 8 }}>{att.date}</Typography>
                  {!readOnly && !att.isCapa && (
                    <Button size="small" onClick={() => setAsCapa(att.id)}>Marcar como Capa</Button>
                  )}
                  {!readOnly && (
                    <Tooltip title="Excluir anexo">
                      <IconButton size="small" onClick={() => handleDeleteAttachment(att.id)} color="secondary">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              ))}
              {!readOnly && (
                <>
                  <input type="file" ref={fileInputRef} multiple className={classes.inputFile} onChange={handleAddAttachment} accept="image/*,.pdf,.doc,.docx,.cdr,.eps,audio/*" />
                  <Button variant="outlined" size="small" startIcon={<Add />} className={classes.addAttachmentBtn} onClick={() => fileInputRef.current?.click()}>
                    Adicionar (imagens, documentos, áudio)
                  </Button>
                </>
              )}
            </Paper>

            <Paper elevation={0} className={classes.logsSection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <History fontSize="small" />
                Histórico de Status
              </Typography>
              {statusLogs.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma alteração de coluna registrada ainda.
                </Typography>
              ) : (
                <div className={classes.timeline} ref={timelineRef}>
                  {statusLogs.length > 0 && (
                    <div
                      className={classes.timelineRunner}
                      aria-hidden="true"
                      style={{
                        top: runnerTop != null ? runnerTop : 8,
                        opacity: runnerTop != null ? 1 : 0,
                      }}
                    />
                  )}
                  {statusLogs.map((log, index) => {
                    const statusColor = getStatusColor(log.toLabel);
                    return (
                      <div
                        key={log.id}
                        data-timeline-item
                        className={classes.timelineItem}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className={classes.timelineDot}
                          style={{
                            backgroundColor: statusColor,
                            animationDelay: `${index * 0.1}s, ${index * 0.1 + 0.5}s`,
                          }}
                        />
                        <div
                          className={classes.timelineCard}
                          style={{ borderLeftColor: statusColor }}
                        >
                          {log.createdAt && (
                            <div
                              className={classes.timelineTime}
                              style={{ color: statusColor }}
                            >
                              {format(parseISO(log.createdAt), "dd/MM/yyyy · HH:mm")}
                            </div>
                          )}
                          <Typography className={classes.timelineLabel}>
                            <span>{log.fromLabel || "?"}</span>
                            {" → "}
                            <strong style={{ color: statusColor }}>{log.toLabel || "?"}</strong>
                          </Typography>
                          {log.userName && (
                            <Typography className={classes.timelineUser}>
                              por {log.userName}
                            </Typography>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Paper>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

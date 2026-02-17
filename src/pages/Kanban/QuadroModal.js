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
import Settings from "@material-ui/icons/Settings";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import {
  Dialog as StatusDialog,
  DialogTitle as StatusDialogTitle,
  DialogContent as StatusDialogContent,
  DialogActions as StatusDialogActions,
} from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Person from "@material-ui/icons/Person";
import FileCopy from "@material-ui/icons/FileCopy";
import Create from "@material-ui/icons/Create";
import { CopyToClipboard } from "react-copy-to-clipboard";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import formatSerializedId from "../../utils/formatSerializedId";

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
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  logsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    userSelect: "none",
    "&:hover": { opacity: 0.85 },
  },
  logsList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: theme.spacing(1),
    maxHeight: 200,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 6,
    backgroundColor: theme.palette.grey[50],
    border: "1px solid",
    borderColor: theme.palette.divider,
    fontSize: "0.78rem",
    flexWrap: "wrap",
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  logTime: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: "0.72rem",
    minWidth: 110,
  },
  logLabel: {
    flex: 1,
    color: theme.palette.text.primary,
    "& span": { color: theme.palette.text.secondary },
  },
  logUser: {
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
    fontStyle: "italic",
  },
  addAttachmentBtn: { marginTop: theme.spacing(1) },
  inputFile: { display: "none" },
  changeClientRow: { marginBottom: theme.spacing(2) },
  changeClientAutocomplete: { minWidth: 280 },
  contactSection: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  contactHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  contactAvatar: {
    width: 56,
    height: 56,
    border: `2px solid ${theme.palette.primary.main}`,
  },
  contactPhoneRow: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  contactFieldsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  contactFieldFull: {
    gridColumn: "1 / -1",
  },
  contactSectionTitle: {
    fontWeight: 600,
    fontSize: 13,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    gridColumn: "1 / -1",
    marginTop: theme.spacing(1),
  },
  contactChipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
    gridColumn: "1 / -1",
  },
  contactProductChip: {
    backgroundColor: theme.palette.primary.light,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
}));

const DEFAULT_STATUSES = [
  { value: "entregue", label: "Entregue", color: "#2e7d32" },
  { value: "em_producao", label: "Em produção", color: "#ed6c02" },
  { value: "aguardando", label: "Aguardando", color: "#1976d2" },
  { value: "cancelado", label: "Cancelado", color: "#757575" },
];

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

function saveStatusesToStorage(statuses) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(statuses));
  } catch (e) {}
}

function getStatusColor(label, statusList) {
  if (!label) return "#1976d2";
  const list = statusList || DEFAULT_STATUSES;
  const match = list.find(
    (s) =>
      s.label?.toLowerCase() === String(label).toLowerCase() ||
      s.value?.toLowerCase() === String(label).toLowerCase()
  );
  if (match?.color) return match.color;
  const t = String(label).toLowerCase();
  if (t.includes("entregue") || t.includes("concluído") || t.includes("concluido")) return "#2e7d32";
  if (t.includes("produção") || t.includes("producao")) return "#ed6c02";
  if (t.includes("cancelado")) return "#757575";
  if (t.includes("aguardando")) return "#1976d2";
  return "#d32f2f";
}

export default function QuadroModal({ open, onClose, ticketUuid, readOnly = true, onOpenShare }) {
  const classes = useStyles();
  useContext(AuthContext);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

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
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUSES);
  const [statusManagerOpen, setStatusManagerOpen] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#1976d2");
  const [editingStatusIdx, setEditingStatusIdx] = useState(null);
  const [valorServico, setValorServico] = useState(0);
  const [valorEntrada, setValorEntrada] = useState(0);
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [customFields, setCustomFields] = useState([]);

  // Estado dos dados do contato (mesmos campos do ContactDrawer)
  const [contactFormData, setContactFormData] = useState({
    name: "", email: "", country: "", city: "", state: "",
    leadOrigin: "", entryDate: "", exitDate: "", dealValue: "0,00",
    company: "", position: "", productInput: "", products: [], observation: "",
  });
  const [contactFormSaving, setContactFormSaving] = useState(false);

  // Carregar status personalizados (API com fallback localStorage)
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const { data } = await api.get("/quadro-statuses");
        const list = data.statuses || data || [];
        if (Array.isArray(list) && list.length > 0) {
          const parsed = list.map((s) => ({
            value: s.value || s.label?.toLowerCase().replace(/\s+/g, "_") || "",
            label: s.label || s.name || "",
            color: s.color || "#1976d2",
          }));
          setStatusOptions(parsed);
          saveStatusesToStorage(parsed);
          return;
        }
      } catch (err) {
        // API indisponível, tentar localStorage
      }
      const stored = loadStatusesFromStorage();
      if (stored) setStatusOptions(stored);
    };
    loadStatuses();
  }, []);

  const saveStatuses = async (newList) => {
    setStatusOptions(newList);
    saveStatusesToStorage(newList);
    try {
      await api.put("/quadro-statuses", { statuses: newList });
    } catch (err) {
      // Salvo no localStorage, backend pode não ter o endpoint ainda
    }
  };

  const handleAddStatus = () => {
    const label = newStatusLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (statusOptions.some((s) => s.value === value)) {
      toast.warn("Já existe um status com esse nome.");
      return;
    }
    const updated = [...statusOptions, { value, label, color: newStatusColor }];
    saveStatuses(updated);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
    toast.success(`Status "${label}" criado.`);
  };

  const handleUpdateStatus = (index) => {
    const label = newStatusLabel.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const updated = statusOptions.map((s, i) =>
      i === index ? { value, label, color: newStatusColor } : s
    );
    saveStatuses(updated);
    setEditingStatusIdx(null);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
    toast.success("Status atualizado.");
  };

  const handleDeleteStatus = (index) => {
    const s = statusOptions[index];
    if (!window.confirm(`Excluir o status "${s.label}"?`)) return;
    const updated = statusOptions.filter((_, i) => i !== index);
    if (updated.length === 0) {
      toast.warn("É necessário ter pelo menos um status.");
      return;
    }
    saveStatuses(updated);
    toast.success("Status removido.");
  };

  const handleEditStatusStart = (index) => {
    setEditingStatusIdx(index);
    setNewStatusLabel(statusOptions[index].label);
    setNewStatusColor(statusOptions[index].color);
  };

  const handleCancelEditStatus = () => {
    setEditingStatusIdx(null);
    setNewStatusLabel("");
    setNewStatusColor("#1976d2");
  };

  const setExtraInfoValueHelper = (extraInfo, fieldName, value) => {
    if (!extraInfo || !Array.isArray(extraInfo)) extraInfo = [];
    const newExtraInfo = [...extraInfo];
    const idx = newExtraInfo.findIndex((info) => info.name?.toLowerCase() === fieldName.toLowerCase());
    if (idx !== -1) {
      newExtraInfo[idx] = { ...newExtraInfo[idx], value };
    } else {
      newExtraInfo.push({ name: fieldName, value });
    }
    return newExtraInfo;
  };

  // Preencher form de contato quando o ticket carrega
  useEffect(() => {
    const contact = ticket?.contact;
    if (contact?.id) {
      const extra = contact.extraInfo || [];
      const productsRaw = getExtraInfoValue(extra, "produtos_interesse");
      setContactFormData({
        name: contact.name || "",
        email: contact.email || "",
        country: getExtraInfoValue(extra, "pais") || "",
        city: getExtraInfoValue(extra, "cidade") || "",
        state: getExtraInfoValue(extra, "estado") || "",
        leadOrigin: getExtraInfoValue(extra, "origem_lead") || "",
        entryDate: getExtraInfoValue(extra, "data_entrada") || "",
        exitDate: getExtraInfoValue(extra, "data_saida") || "",
        dealValue: getExtraInfoValue(extra, "valor_negocio") || "0,00",
        company: getExtraInfoValue(extra, "empresa") || "",
        position: getExtraInfoValue(extra, "cargo") || "",
        productInput: "",
        products: productsRaw ? productsRaw.split(",").map((p) => p.trim()).filter(Boolean) : [],
        observation: getExtraInfoValue(extra, "observacao") || "",
      });
    }
  }, [ticket]);

  const handleContactFieldChange = (field, value) => {
    setContactFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAllContactFields = async () => {
    const contact = ticket?.contact;
    if (!contact?.id) return;
    setContactFormSaving(true);
    try {
      let updateData = {};
      let extraInfo = contact.extraInfo ? [...contact.extraInfo] : [];

      updateData.name = contactFormData.name;
      updateData.email = contactFormData.email;

      const extraFieldMap = {
        country: "pais", city: "cidade", state: "estado",
        leadOrigin: "origem_lead", entryDate: "data_entrada",
        exitDate: "data_saida", dealValue: "valor_negocio",
        company: "empresa", position: "cargo",
        products: "produtos_interesse", observation: "observacao",
      };

      for (const [field, extraName] of Object.entries(extraFieldMap)) {
        const value = field === "products" ? contactFormData.products.join(", ") : contactFormData[field];
        extraInfo = setExtraInfoValueHelper(extraInfo, extraName, value);
      }
      updateData.extraInfo = extraInfo;

      await api.put(`/contacts/${contact.id}`, updateData);
      toast.success("Dados do contato salvos com sucesso!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erro ao salvar dados do contato.");
    }
    setContactFormSaving(false);
  };

  const handleContactAddProduct = () => {
    const product = contactFormData.productInput.trim();
    if (!product) return;
    const newProducts = [...contactFormData.products, product];
    setContactFormData((prev) => ({ ...prev, products: newProducts, productInput: "" }));
  };

  const handleContactRemoveProduct = (index) => {
    const newProducts = contactFormData.products.filter((_, i) => i !== index);
    setContactFormData((prev) => ({ ...prev, products: newProducts }));
  };

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
      setLogsExpanded(false);
      return;
    }
    setLoading(true);
    loadAll();
  }, [open, ticketUuid, onClose, loadAll]);

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

  const getExtraInfoValue = (extraInfo, fieldName) => {
    if (!extraInfo || !Array.isArray(extraInfo)) return "";
    const found = extraInfo.find(
      (info) => info.name?.toLowerCase() === fieldName.toLowerCase()
    );
    return found?.value || "";
  };

  const handleTrocarCliente = async () => {
    if (!selectedNewContact?.id || !ticket?.id) return;
    try {
      // Buscar dados completos do contato (incluindo extraInfo)
      let fullContact = selectedNewContact;
      try {
        const { data } = await api.get(`/contacts/${selectedNewContact.id}`);
        fullContact = data || selectedNewContact;
      } catch (fetchErr) {
        // Usa os dados do autocomplete se falhar
      }

      await api.put(`/tickets/${ticket.id}/contact`, { contactId: fullContact.id });

      // Auto-preencher campos com os dados do contato
      const extra = fullContact.extraInfo || [];
      const contactCompany = getExtraInfoValue(extra, "empresa") || getExtraInfoValue(extra, "nome_empresa") || getExtraInfoValue(extra, "company") || "";
      const contactCpfCnpj = getExtraInfoValue(extra, "cpf") || getExtraInfoValue(extra, "cnpj") || getExtraInfoValue(extra, "cpf_cnpj") || "";
      const contactAddress = getExtraInfoValue(extra, "endereco") || getExtraInfoValue(extra, "endereço") || getExtraInfoValue(extra, "address") || "";
      const contactEmail = fullContact.email || getExtraInfoValue(extra, "email") || "";

      // Preencher nome do projeto com a empresa se vazio
      if (!nomeProjeto && contactCompany) {
        setNomeProjeto(contactCompany);
      }

      // Criar campos personalizados automaticamente com dados do contato
      const autoFields = [];
      if (contactCpfCnpj) autoFields.push({ name: "CPF/CNPJ", value: contactCpfCnpj, type: "text" });
      if (fullContact.name) autoFields.push({ name: "Nome do Cliente", value: fullContact.name, type: "text" });
      if (contactCompany) autoFields.push({ name: "Empresa", value: contactCompany, type: "text" });
      if (contactEmail) autoFields.push({ name: "E-mail", value: contactEmail, type: "text" });
      if (fullContact.number) autoFields.push({ name: "Contato", value: fullContact.number, type: "text" });
      if (contactAddress) autoFields.push({ name: "Endereço", value: contactAddress, type: "text" });

      // Mesclar com campos existentes (não sobrescrever campos que já existem)
      if (autoFields.length > 0) {
        setCustomFields((prev) => {
          const existingNames = prev.map((f) => (f.name || "").toLowerCase().trim());
          const newFields = autoFields.filter(
            (af) => !existingNames.includes(af.name.toLowerCase().trim())
          );
          const merged = [...prev, ...newFields];
          return merged;
        });
      }

      toast.success("Cliente vinculado e campos preenchidos automaticamente.");
      setTicket((prev) => (prev ? { ...prev, contact: fullContact } : null));
      const newPic = fullContact.urlPicture || fullContact.profilePicUrl || null;
      setCoverImage(resolveImageUrl(newPic));
      setChangeClientOpen(false);
      setSelectedNewContact(null);
      setContactSearch("");

      // Salvar automaticamente os campos e valores no backend
      try {
        const allFields = [...customFields];
        const existingNames = allFields.map((f) => (f.name || "").toLowerCase().trim());
        const autoFieldsMerged = autoFields.filter(
          (af) => !existingNames.includes(af.name.toLowerCase().trim())
        );
        const finalFields = [...allFields, ...autoFieldsMerged].filter((f) => (f.name || "").trim());
        await api.put("/tickets/" + ticket.id + "/quadro", {
          valorServico,
          valorEntrada,
          nomeProjeto: (!nomeProjeto && contactCompany) ? contactCompany : (nomeProjeto || undefined),
          customFields: finalFields.map((f) => ({ name: (f.name || "").trim(), value: (f.value || "").trim(), type: f.type || "text" })),
        });
      } catch (saveErr) {
        // Não-crítico, os campos já foram preenchidos na UI
      }
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
              Status: <strong>{statusOptions.find((o) => o.value === status)?.label || status}</strong>
            </Typography>
          ) : (
            <>
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
                  renderValue={(val) => {
                    const opt = statusOptions.find((o) => o.value === val);
                    return (
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FiberManualRecord style={{ fontSize: 12, color: opt?.color || "#999" }} />
                        {opt?.label || val}
                      </span>
                    );
                  }}
                >
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <FiberManualRecord style={{ fontSize: 12, color: opt.color, marginRight: 8 }} />
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Gerenciar status personalizados">
                <IconButton size="small" onClick={() => setStatusManagerOpen(true)} style={{ marginLeft: 4 }}>
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
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
                <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
                  Vincular contato
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" style={{ marginBottom: 12 }}>
                  Ao vincular um contato, os dados (CPF/CNPJ, nome, empresa, e-mail, telefone, endereço) serão preenchidos automaticamente.
                </Typography>
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
                    Vincular e preencher
                  </Button>
                  <Button size="small" onClick={() => setChangeClientOpen(false)}>Cancelar</Button>
                </div>
                {selectedNewContact && (
                  <Paper
                    variant="outlined"
                    style={{
                      marginTop: 12,
                      padding: 12,
                      backgroundColor: "#f0f7ff",
                      borderColor: "#90caf9",
                      borderRadius: 8,
                    }}
                  >
                    <Typography variant="caption" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
                      Dados que serão preenchidos:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" style={{ gap: 8 }}>
                      {selectedNewContact.name && (
                        <Typography variant="caption" style={{ backgroundColor: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>
                          Nome: {selectedNewContact.name}
                        </Typography>
                      )}
                      {selectedNewContact.number && (
                        <Typography variant="caption" style={{ backgroundColor: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>
                          Tel: {selectedNewContact.number}
                        </Typography>
                      )}
                      {selectedNewContact.email && (
                        <Typography variant="caption" style={{ backgroundColor: "#e3f2fd", padding: "2px 8px", borderRadius: 4 }}>
                          E-mail: {selectedNewContact.email}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                )}
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

            {/* DADOS DO CONTATO */}
            <Paper elevation={0} className={classes.contactSection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>
                Dados do Contato
              </Typography>

              {/* Header com avatar + nome + telefone */}
              <div className={classes.contactHeader}>
                <Avatar
                  className={classes.contactAvatar}
                  src={resolveImageUrl(ticket?.contact?.urlPicture || ticket?.contact?.profilePicUrl)}
                >
                  {!ticket?.contact?.urlPicture && !ticket?.contact?.profilePicUrl && (
                    <Person style={{ fontSize: 28 }} />
                  )}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" style={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                    {contactFormData.name || ticket?.contact?.name || "—"}
                  </Typography>
                  <div className={classes.contactPhoneRow}>
                    <Typography variant="body2" color="textSecondary">
                      {formatSerializedId(ticket?.contact?.number) || ticket?.contact?.number || "—"}
                    </Typography>
                    {ticket?.contact?.number && (
                      <CopyToClipboard text={ticket.contact.number} onCopy={() => toast.success("Número copiado!")}>
                        <Tooltip title="Copiar número">
                          <IconButton size="small" style={{ padding: 2 }}>
                            <FileCopy style={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </CopyToClipboard>
                    )}
                  </div>
                </div>
              </div>

              <div className={classes.contactFieldsGrid}>
                {/* Nome */}
                <TextField
                  label="Nome"
                  value={contactFormData.name}
                  onChange={(e) => handleContactFieldChange("name", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  InputProps={!readOnly ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Create style={{ fontSize: 14, color: "#aaa" }} />
                      </InputAdornment>
                    ),
                  } : undefined}
                />

                {/* Email */}
                <TextField
                  label="Email"
                  value={contactFormData.email}
                  onChange={(e) => handleContactFieldChange("email", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="Digite o email"
                />

                {/* País */}
                <TextField
                  label="País"
                  value={contactFormData.country}
                  onChange={(e) => handleContactFieldChange("country", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="País"
                />

                {/* Cidade */}
                <TextField
                  label="Cidade"
                  value={contactFormData.city}
                  onChange={(e) => handleContactFieldChange("city", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="Cidade"
                />

                {/* Estado */}
                <TextField
                  label="Estado"
                  value={contactFormData.state}
                  onChange={(e) => handleContactFieldChange("state", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="Estado"
                />

                {/* Origem do Lead */}
                <FormControl variant="outlined" size="small" fullWidth disabled={readOnly}>
                  <InputLabel>Origem do lead</InputLabel>
                  <Select
                    value={contactFormData.leadOrigin}
                    onChange={(e) => handleContactFieldChange("leadOrigin", e.target.value)}
                    label="Origem do lead"
                  >
                    <MenuItem value=""><em>Selecione</em></MenuItem>
                    <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    <MenuItem value="facebook">Facebook</MenuItem>
                    <MenuItem value="instagram">Instagram</MenuItem>
                    <MenuItem value="site">Site</MenuItem>
                    <MenuItem value="indicacao">Indicação</MenuItem>
                    <MenuItem value="google">Google</MenuItem>
                    <MenuItem value="outro">Outro</MenuItem>
                  </Select>
                </FormControl>

                <Typography className={classes.contactSectionTitle}>
                  Datas
                </Typography>

                {/* Data de entrada */}
                <TextField
                  label="Data de entrada"
                  type="date"
                  value={contactFormData.entryDate}
                  onChange={(e) => handleContactFieldChange("entryDate", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Data de saída */}
                <TextField
                  label="Data de saída"
                  type="date"
                  value={contactFormData.exitDate}
                  onChange={(e) => handleContactFieldChange("exitDate", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  InputLabelProps={{ shrink: true }}
                />

                <Typography className={classes.contactSectionTitle}>
                  Negócio
                </Typography>

                {/* Valor do Negócio */}
                <TextField
                  label="Valor do Negócio"
                  value={contactFormData.dealValue}
                  onChange={(e) => handleContactFieldChange("dealValue", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />

                {/* Empresa */}
                <TextField
                  label="Empresa"
                  value={contactFormData.company}
                  onChange={(e) => handleContactFieldChange("company", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="Empresa"
                />

                {/* Cargo */}
                <TextField
                  label="Cargo"
                  value={contactFormData.position}
                  onChange={(e) => handleContactFieldChange("position", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  disabled={readOnly}
                  placeholder="Cargo"
                />

                <Typography className={classes.contactSectionTitle}>
                  Produtos de Interesse
                </Typography>

                {/* Produtos - input só no modo edição */}
                {!readOnly && (
                  <div className={classes.contactFieldFull} style={{ display: "flex", gap: 8 }}>
                    <TextField
                      label="Produto"
                      value={contactFormData.productInput}
                      onChange={(e) => handleContactFieldChange("productInput", e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleContactAddProduct(); }
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                      placeholder="Digite um produto"
                    />
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleContactAddProduct}
                      style={{ whiteSpace: "nowrap", minWidth: "auto" }}
                    >
                      +
                    </Button>
                  </div>
                )}

                {contactFormData.products.length > 0 && (
                  <div className={classes.contactChipContainer}>
                    {contactFormData.products.map((product, pIdx) => (
                      <span key={pIdx} className={classes.contactProductChip}>
                        {product}
                        {!readOnly && (
                          <Close
                            style={{ fontSize: 14, cursor: "pointer" }}
                            onClick={() => handleContactRemoveProduct(pIdx)}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {contactFormData.products.length === 0 && readOnly && (
                  <Typography variant="body2" color="textSecondary" className={classes.contactFieldFull}>
                    Nenhum produto cadastrado.
                  </Typography>
                )}

                <Typography className={classes.contactSectionTitle}>
                  Observações
                </Typography>

                {/* Observações */}
                <TextField
                  className={classes.contactFieldFull}
                  value={contactFormData.observation}
                  onChange={(e) => handleContactFieldChange("observation", e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  disabled={readOnly}
                  placeholder="Digite uma observação"
                />

                {/* BOTÃO SALVAR TUDO */}
                {!readOnly && (
                  <Button
                    className={classes.contactFieldFull}
                    variant="contained"
                    color="primary"
                    size="small"
                    fullWidth
                    onClick={handleSaveAllContactFields}
                    disabled={contactFormSaving}
                    style={{ marginTop: 4, fontWeight: 600 }}
                  >
                    {contactFormSaving ? "Salvando..." : "Salvar Dados do Contato"}
                  </Button>
                )}
              </div>
            </Paper>

            <Divider style={{ marginBottom: 16 }} />

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
              <div
                className={classes.logsHeader}
                onClick={() => setLogsExpanded((v) => !v)}
              >
                <Typography variant="subtitle2" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <History fontSize="small" />
                  Histórico de Status ({statusLogs.length})
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {logsExpanded ? "▲ Recolher" : "▼ Expandir"}
                </Typography>
              </div>
              {logsExpanded && (
                statusLogs.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                    Nenhuma alteração de coluna registrada.
                  </Typography>
                ) : (
                  <div className={classes.logsList}>
                    {statusLogs.map((log) => {
                      const statusColor = getStatusColor(log.toLabel, statusOptions);
                      return (
                        <div key={log.id} className={classes.logRow}>
                          <div
                            className={classes.logDot}
                            style={{ backgroundColor: statusColor }}
                          />
                          <span className={classes.logTime}>
                            {log.createdAt
                              ? format(parseISO(log.createdAt), "dd/MM/yy HH:mm")
                              : "—"}
                          </span>
                          <span className={classes.logLabel}>
                            <span>{log.fromLabel || "?"}</span>
                            {" → "}
                            <strong style={{ color: statusColor }}>{log.toLabel || "?"}</strong>
                          </span>
                          {log.userName && (
                            <span className={classes.logUser}>
                              {log.userName}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </Paper>
          </>
        )}
      </DialogContent>

      {/* Gerenciador de Status Personalizados */}
      <StatusDialog
        open={statusManagerOpen}
        onClose={() => { setStatusManagerOpen(false); handleCancelEditStatus(); }}
        maxWidth="sm"
        fullWidth
      >
        <StatusDialogTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings fontSize="small" />
            Gerenciar Status Personalizados
          </div>
        </StatusDialogTitle>
        <StatusDialogContent dividers>
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: 16 }}>
            Crie, edite ou remova status para adaptar o quadro ao seu processo de trabalho.
          </Typography>

          {/* Lista de status existentes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {statusOptions.map((s, idx) => (
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
                <FiberManualRecord style={{ fontSize: 16, color: s.color }} />
                <Typography variant="body2" style={{ flex: 1, fontWeight: 500 }}>
                  {s.label}
                </Typography>
                <Typography variant="caption" color="textSecondary" style={{ marginRight: 8 }}>
                  {s.value}
                </Typography>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEditStatusStart(idx)}>
                    <Edit style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" onClick={() => handleDeleteStatus(idx)} style={{ color: "#d32f2f" }}>
                    <Delete style={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Paper>
            ))}
          </div>

          {/* Formulário de adicionar/editar */}
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
              {/* Cores rápidas */}
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
        </StatusDialogContent>
        <StatusDialogActions>
          <Button onClick={() => { setStatusManagerOpen(false); handleCancelEditStatus(); }}>
            Fechar
          </Button>
        </StatusDialogActions>
      </StatusDialog>
    </Dialog>
  );
}

import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Tooltip,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Close from "@material-ui/icons/Close";
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
  statusSelect: {
    minWidth: 160,
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
  addAttachmentBtn: { marginTop: theme.spacing(1) },
  inputFile: { display: "none" },
  changeClientRow: {
    marginBottom: theme.spacing(2),
  },
  changeClientAutocomplete: {
    minWidth: 280,
  },
  logsSection: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  logItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 0),
    borderBottom: "1px solid",
    borderColor: theme.palette.divider,
    "&:last-child": { borderBottom: "none" },
  },
  logText: {
    fontSize: "0.85rem",
  },
  logUser: {
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
}));

const STATUS_OPTIONS = [
  { value: "entregue", label: "Entregue" },
  { value: "em_producao", label: "Em produção" },
  { value: "aguardando", label: "Aguardando" },
  { value: "cancelado", label: "Cancelado" },
];

export default function QuadroModal({ open, onClose, ticketUuid }) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
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
  const [changeClientOpen, setChangeClientOpen] = useState(false);
  const [contactOptions, setContactOptions] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedNewContact, setSelectedNewContact] = useState(null);
  const [loadingContact, setLoadingContact] = useState(false);
  const [statusLogs, setStatusLogs] = useState([]);

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

  useEffect(() => {
    if (!open || !ticketUuid) {
      setTicket(null);
      setCoverImage(null);
      setStatus("aguardando");
      setDescription("");
      setAttachments([]);
      setEditMode(false);
      return;
    }
    setLoading(true);
    const loadAll = async () => {
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
      } catch (err) {
        toast.error("Ticket não encontrado.");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [open, ticketUuid, onClose]);

  useEffect(() => {
    if (!open || !ticket?.id) return;
    const fetchLogs = async () => {
      try {
        const { data } = await api.get(`/tickets/${ticket.id}/quadro/logs`);
        setStatusLogs(data.logs || []);
      } catch (err) {
        setStatusLogs([]);
      }
    };
    fetchLogs();
  }, [open, ticket?.id]);

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

  useEffect(() => {
    if (!changeClientOpen || contactSearch.length < 2) {
      setContactOptions([]);
      return;
    }
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
  }, [changeClientOpen, contactSearch]);

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
          <Tooltip title="Trocar cliente vinculado">
            <IconButton size="small" onClick={() => setChangeClientOpen((v) => !v)}>
              <PersonAdd fontSize="small" />
            </IconButton>
          </Tooltip>
          {queueName && (
            <Typography variant="caption" color="textSecondary">
              {queueName}
              {whatsappName ? ` · ${whatsappName}` : ""}
              {assignedUser ? ` · ${assignedUser}` : ""}
            </Typography>
          )}
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
        </div>
        <IconButton onClick={onClose} size="small" aria-label="Fechar">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Typography color="textSecondary">Carregando...</Typography>
        ) : (
          <>
            {changeClientOpen && (
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
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={!selectedNewContact}
                    onClick={handleTrocarCliente}
                  >
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

            <div className={classes.actionsRow}>
              <Tooltip title="Editar descrição">
                <IconButton size="small" onClick={handleEditClick}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ajuda">
                <IconButton size="small">
                  <HelpOutline />
                </IconButton>
              </Tooltip>
            </div>

            <Paper elevation={0} className={classes.editorCard}>
              {!editMode ? (
                <Box
                  onClick={handleEditClick}
                  style={{ cursor: "pointer", minHeight: 50, padding: 16 }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <>
                  <div className={classes.toolbar}>
                    <Tooltip title="Tamanho">
                      <Select
                        size="small"
                        value=""
                        displayEmpty
                        style={{ minWidth: 48, height: 32 }}
                        onMouseDown={(e) => e.preventDefault()}
                        onChange={(e) => execCmd("fontSize", e.target.value)}
                      >
                        <MenuItem value="1">P</MenuItem>
                        <MenuItem value="3">Tt</MenuItem>
                        <MenuItem value="5">H</MenuItem>
                      </Select>
                    </Tooltip>
                    <IconButton size="small" onClick={() => execCmd("bold")} title="Negrito">
                      <Typography style={{ fontWeight: 700 }}>B</Typography>
                    </IconButton>
                    <IconButton size="small" onClick={() => execCmd("italic")} title="Itálico">
                      <Typography style={{ fontStyle: "italic" }}>I</Typography>
                    </IconButton>
                    <IconButton size="small" onClick={() => execCmd("insertUnorderedList")} title="Lista">
                      <FormatListBulleted fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleInsertLink} title="Link">
                      <Link fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => imageInputRef.current?.click()} title="Inserir imagem">
                      <Image fontSize="small" />
                    </IconButton>
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      className={classes.inputFile}
                      onChange={handleInsertImage}
                    />
                    <IconButton size="small" title="Adicionar elemento">
                      <Add fontSize="small" />
                    </IconButton>
                  </div>
                  <div
                    ref={editorRef}
                    className={classes.editorArea}
                    contentEditable
                    suppressContentEditableWarning
                  />
                  <div className={classes.editorButtons}>
                    <Button variant="contained" color="primary" size="small" startIcon={<Save />} onClick={handleSave}>
                      Salvar
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<DeleteOutline />} onClick={handleDiscard}>
                      Descartar alterações
                    </Button>
                    <Button size="small" startIcon={<HelpOutline />}>
                      Ajuda para formatação
                    </Button>
                  </div>
                </>
              )}
            </Paper>

            <Paper elevation={0} className={classes.attachmentsSection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12 }}>
                Anexos
              </Typography>
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
                  <Typography variant="caption" color="textSecondary" style={{ marginRight: 8 }}>
                    {att.date}
                  </Typography>
                  {!att.isCapa && (
                    <Button size="small" onClick={() => setAsCapa(att.id)}>
                      Marcar como Capa
                    </Button>
                  )}
                </div>
              ))}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className={classes.inputFile}
                onChange={handleAddAttachment}
                accept="image/*,.pdf,.doc,.docx,.cdr,.eps,audio/*"
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                className={classes.addAttachmentBtn}
                onClick={() => fileInputRef.current?.click()}
              >
                Adicionar (imagens, documentos, áudio)
              </Button>
            </Paper>

            <Paper elevation={0} className={classes.logsSection}>
              <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <History fontSize="small" />
                Logs de Status
              </Typography>
              {statusLogs.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma alteração de coluna registrada ainda.
                </Typography>
              ) : (
                statusLogs.map((log) => (
                  <div key={log.id} className={classes.logItem}>
                    <Typography className={classes.logText}>
                      {log.createdAt
                        ? `${format(parseISO(log.createdAt), "dd/MM HH:mm")} – ${log.fromLabel || "?"} → ${log.toLabel || "?"}`
                        : `${log.fromLabel || "?"} → ${log.toLabel || "?"}`}
                    </Typography>
                    {log.userName && (
                      <Typography className={classes.logUser}>por {log.userName}</Typography>
                    )}
                  </div>
                ))
              )}
            </Paper>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

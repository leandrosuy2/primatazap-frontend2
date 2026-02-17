import React, { useEffect, useState, useContext, useCallback } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Collapse from "@material-ui/core/Collapse";
import CircularProgress from "@material-ui/core/CircularProgress";

import ChatIcon from "@material-ui/icons/Chat";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HistoryIcon from "@material-ui/icons/History";
import SettingsIcon from "@material-ui/icons/Settings";
import ShareIcon from "@material-ui/icons/Share";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CreateIcon from "@material-ui/icons/Create";
import PersonIcon from "@material-ui/icons/Person";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ImageIcon from "@material-ui/icons/Image";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import { format, parseISO } from "date-fns";

import { CopyToClipboard } from "react-copy-to-clipboard";

import formatSerializedId from "../../utils/formatSerializedId";
import { i18n } from "../../translate/i18n";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { toast } from "react-toastify";
import { TagsKanbanContainer } from "../TagsKanbanContainer";
import { ContactNotes } from "../ContactNotes";
import ContactModal from "../ContactModal";

const drawerWidth = 450;

const useStyles = makeStyles((theme) => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
		overflowX: "hidden",
		boxSizing: "border-box",
	},
	topBar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "4px 8px",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: theme.palette.primary.main,
		minHeight: 48,
	},
	topBarIcons: {
		display: "flex",
		alignItems: "center",
		gap: 2,
	},
	topBarIcon: {
		color: "#fff",
		padding: 6,
	},
	content: {
		display: "flex",
		backgroundColor: theme.palette.inputBackground,
		flexDirection: "column",
		padding: "0px",
		height: "100%",
		overflowY: "auto",
		...theme.scrollbarStyles,
	},
	profileSection: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "16px 16px 12px",
		position: "relative",
	},
	shareIcon: {
		position: "absolute",
		top: 8,
		right: 8,
	},
	avatar: {
		width: 100,
		height: 100,
		marginBottom: 8,
		border: `3px solid ${theme.palette.primary.main}`,
	},
	phoneRow: {
		display: "flex",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
	},
	phoneNumber: {
		fontWeight: 600,
		fontSize: 15,
		color: theme.palette.text.primary,
	},
	copyIcon: {
		padding: 4,
		color: theme.palette.primary.main,
	},
	tabsRoot: {
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		minHeight: 36,
		backgroundColor: "#fff",
	},
	tab: {
		minHeight: 36,
		textTransform: "none",
		fontWeight: 600,
		fontSize: 13,
	},
	formSection: {
		padding: "8px 16px 16px",
		display: "flex",
		flexDirection: "column",
		gap: 10,
		overflowX: "hidden",
		boxSizing: "border-box",
		maxWidth: "100%",
	},
	sectionTitle: {
		fontWeight: 600,
		fontSize: 14,
		color: theme.palette.text.secondary,
		marginTop: 8,
		marginBottom: 4,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	fieldRow: {
		display: "flex",
		alignItems: "center",
		gap: 4,
		maxWidth: "100%",
		"& .MuiTextField-root": {
			minWidth: 0,
			flex: 1,
		},
	},
	valueButton: {
		marginTop: 4,
		textTransform: "none",
	},
	chipContainer: {
		display: "flex",
		flexWrap: "wrap",
		gap: 4,
		marginTop: 4,
	},
	productChip: {
		backgroundColor: theme.palette.primary.light,
		color: "#fff",
		padding: "2px 8px",
		borderRadius: 12,
		fontSize: 12,
		display: "flex",
		alignItems: "center",
		gap: 4,
	},
	processCard: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		padding: "14px 16px",
		borderRadius: 10,
		border: "1px solid",
		borderColor: theme.palette.divider,
		backgroundColor: "#fff",
		transition: "box-shadow 0.15s, transform 0.15s",
		"&:hover": {
			boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
			transform: "translateY(-1px)",
		},
	},
	processName: {
		fontWeight: 600,
		fontSize: 14,
		color: theme.palette.text.primary,
		display: "flex",
		alignItems: "center",
		gap: 8,
	},
	processCount: {
		fontWeight: 700,
		fontSize: 18,
		color: theme.palette.primary.main,
		backgroundColor: theme.palette.primary.main + "14",
		borderRadius: 8,
		padding: "4px 12px",
		minWidth: 36,
		textAlign: "center",
	},
	processIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#fff",
		fontSize: 16,
		fontWeight: 700,
		flexShrink: 0,
	},
	processCardClickable: {
		cursor: "pointer",
		userSelect: "none",
	},
	processExpandIcon: {
		transition: "transform 0.2s ease",
		color: theme.palette.text.secondary,
		fontSize: 20,
	},
	processExpandIconOpen: {
		transform: "rotate(180deg)",
	},
	processTicketsList: {
		padding: "8px 0 4px",
		display: "flex",
		flexDirection: "column",
		gap: 6,
	},
	processTicketItem: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "8px 10px",
		borderRadius: 8,
		backgroundColor: theme.palette.background.default,
		border: "1px solid " + theme.palette.divider,
		transition: "background-color 0.15s",
		"&:hover": {
			backgroundColor: theme.palette.action.hover,
		},
	},
	processTicketThumb: {
		width: 40,
		height: 40,
		borderRadius: 6,
		objectFit: "cover",
		backgroundColor: theme.palette.grey[200],
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
		overflow: "hidden",
	},
	processTicketInfo: {
		flex: 1,
		minWidth: 0,
	},
	processTicketName: {
		fontSize: 13,
		fontWeight: 600,
		color: theme.palette.text.primary,
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	processTicketMeta: {
		fontSize: 11,
		color: theme.palette.text.secondary,
		display: "flex",
		alignItems: "center",
		gap: 6,
		marginTop: 2,
	},
	processTicketStatus: {
		display: "inline-flex",
		alignItems: "center",
		gap: 3,
		fontSize: 11,
		fontWeight: 500,
	},
	processTicketMediaBadge: {
		display: "inline-flex",
		alignItems: "center",
		gap: 2,
		fontSize: 11,
		color: theme.palette.info.main,
	},
	processLoadingRow: {
		display: "flex",
		justifyContent: "center",
		padding: "12px 0",
	},
}));

const getExtraInfoValue = (extraInfo, fieldName) => {
	if (!extraInfo || !Array.isArray(extraInfo)) return "";
	const field = extraInfo.find(
		(info) => info.name?.toLowerCase() === fieldName.toLowerCase()
	);
	return field?.value || "";
};

const setExtraInfoValue = (extraInfo, fieldName, value) => {
	if (!extraInfo || !Array.isArray(extraInfo)) extraInfo = [];
	const newExtraInfo = [...extraInfo];
	const index = newExtraInfo.findIndex(
		(info) => info.name?.toLowerCase() === fieldName.toLowerCase()
	);
	if (index !== -1) {
		newExtraInfo[index] = { ...newExtraInfo[index], value };
	} else {
		newExtraInfo.push({ name: fieldName, value });
	}
	return newExtraInfo;
};

const ContactDrawer = ({ open, handleDrawerClose, contact, ticket, loading }) => {
	const classes = useStyles();
	const { user } = useContext(AuthContext);
	const { get } = useCompanySettings();

	const [modalOpen, setModalOpen] = useState(false);
	const [hideNum, setHideNum] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		country: "",
		city: "",
		state: "",
		leadOrigin: "",
		entryDate: "",
		exitDate: "",
		dealValue: "0,00",
		company: "",
		position: "",
		productInput: "",
		products: [],
		observation: "",
	});

	const [editingField, setEditingField] = useState(null);
	const [saving, setSaving] = useState(false);
	const [activeTab, setActiveTab] = useState(0);
	const [contactProcesses, setContactProcesses] = useState([]);
	const [loadingProcesses, setLoadingProcesses] = useState(false);
	const [expandedProcess, setExpandedProcess] = useState(null);
	const [processTickets, setProcessTickets] = useState({});
	const [loadingProcessTickets, setLoadingProcessTickets] = useState({});

	useEffect(() => {
		async function fetchData() {
			try {
				const lgpdHideNumber = await get({ column: "lgpdHideNumber" });
				if (lgpdHideNumber === "enabled") setHideNum(true);
			} catch (err) {
				// ignore
			}
		}
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (contact?.id) {
			const extra = contact.extraInfo || [];
			const productsRaw = getExtraInfoValue(extra, "produtos_interesse");
			setFormData({
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
	}, [contact]);

	// Carregar processos do contato (em quantos quadros/áreas ele está)
	useEffect(() => {
		if (activeTab !== 2 || !contact?.id) return;
		const loadProcesses = async () => {
			setLoadingProcesses(true);
			try {
				// Tenta buscar da API
				const { data } = await api.get(`/contacts/${contact.id}/processes`);
				setContactProcesses(data.processes || data || []);
			} catch (err) {
				// Fallback: buscar tickets do contato e agrupar por quadro group
				try {
					const { data: ticketsData } = await api.get("/ticket/kanban", {
						params: { contactId: contact.id },
					});
					const ticketsList = ticketsData.tickets || [];
					// Também buscar grupos
					let groups = [];
					try {
						const { data: groupsData } = await api.get("/quadro-groups");
						groups = groupsData.groups || groupsData.lista || groupsData || [];
					} catch (gErr) {
						groups = [{ id: 1, name: "Kanban" }];
					}
					// Agrupar tickets por quadroGroupId
					const groupMap = {};
					for (const t of ticketsList) {
						const gId = t.quadroGroupId || t.quadro_group_id || "1";
						if (!groupMap[gId]) groupMap[gId] = 0;
						groupMap[gId]++;
					}
					// Montar lista de processos
					const processList = Object.entries(groupMap).map(([gId, count]) => {
						const group = groups.find((g) => String(g.id) === String(gId));
						return {
							groupId: gId,
							groupName: group?.name || "Kanban",
							count,
						};
					});
					setContactProcesses(processList);
				} catch (innerErr) {
					setContactProcesses([]);
				}
			}
			setLoadingProcesses(false);
		};
		loadProcesses();
	}, [activeTab, contact?.id]);

	const handleToggleProcess = async (groupId) => {
		if (expandedProcess === groupId) {
			setExpandedProcess(null);
			return;
		}
		setExpandedProcess(groupId);

		if (processTickets[groupId]) return;

		setLoadingProcessTickets((prev) => ({ ...prev, [groupId]: true }));
		try {
			const { data } = await api.get("/ticket/kanban", {
				params: { contactId: contact.id, quadroGroupId: groupId },
			});
			const ticketsList = data.tickets || data || [];

			const enriched = await Promise.all(
				ticketsList.map(async (t) => {
					let quadroData = null;
					let attachments = [];
					try {
						const { data: qd } = await api.get(`/tickets/${t.uuid || t.id}/quadro`);
						quadroData = qd.quadro || null;
						attachments = qd.attachments || [];
					} catch (_) {}
					return {
						id: t.id,
						uuid: t.uuid,
						contactName: t.contact?.name || contact?.name || "Sem nome",
						contactPic: t.contact?.urlPicture || t.contact?.profilePicUrl || null,
						status: quadroData?.status || "aguardando",
						description: quadroData?.description || "",
						nomeProjeto: quadroData?.nomeProjeto || "",
						valorServico: quadroData?.valorServico || 0,
						createdAt: t.createdAt,
						updatedAt: t.updatedAt,
						attachments,
						hasMedia: attachments.length > 0,
						capaUrl: (attachments.find((a) => a.isCapa) || attachments[0])?.url || null,
						tagName: t.tags?.[0]?.tag || t.tags?.[0]?.name || "",
					};
				})
			);
			setProcessTickets((prev) => ({ ...prev, [groupId]: enriched }));
		} catch (err) {
			setProcessTickets((prev) => ({ ...prev, [groupId]: [] }));
		}
		setLoadingProcessTickets((prev) => ({ ...prev, [groupId]: false }));
	};

	const resolveImageUrl = (url) => {
		if (!url || typeof url !== "string") return null;
		if (url.startsWith("http://") || url.startsWith("https://")) return url;
		const base = process.env.REACT_APP_BACKEND_URL || "";
		return base + (url.startsWith("/") ? url : "/" + url);
	};

	const getStatusColor = (status) => {
		const map = {
			aguardando: "#fbc02d",
			em_andamento: "#1976d2",
			concluido: "#388e3c",
			cancelado: "#d32f2f",
		};
		return map[status] || "#9e9e9e";
	};

	const getStatusLabel = (status) => {
		const map = {
			aguardando: "Aguardando",
			em_andamento: "Em andamento",
			concluido: "Concluído",
			cancelado: "Cancelado",
		};
		return map[status] || status;
	};

	const handleFieldChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveAllContactFields = useCallback(
		async () => {
			if (!contact?.id) return;
			setSaving(true);

			try {
				let updateData = {};
				let extraInfo = contact.extraInfo ? [...contact.extraInfo] : [];

				updateData.name = formData.name;
				updateData.email = formData.email;

				const extraFieldMap = {
					country: "pais",
					city: "cidade",
					state: "estado",
					leadOrigin: "origem_lead",
					entryDate: "data_entrada",
					exitDate: "data_saida",
					dealValue: "valor_negocio",
					company: "empresa",
					position: "cargo",
					products: "produtos_interesse",
					observation: "observacao",
				};

				for (const [field, extraName] of Object.entries(extraFieldMap)) {
					const value = field === "products" ? formData.products.join(", ") : formData[field];
					extraInfo = setExtraInfoValue(extraInfo, extraName, value);
				}
				updateData.extraInfo = extraInfo;

				await api.put(`/contacts/${contact.id}`, updateData);
				setEditingField(null);
				toast.success("Dados do contato salvos com sucesso!");
			} catch (err) {
				toastError(err);
			}
			setSaving(false);
		},
		[contact, formData]
	);

	const handleAddProduct = () => {
		const product = formData.productInput.trim();
		if (!product) return;
		const newProducts = [...formData.products, product];
		setFormData((prev) => ({ ...prev, products: newProducts, productInput: "" }));
	};

	const handleRemoveProduct = (index) => {
		const newProducts = formData.products.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, products: newProducts }));
	};

	const handleCopy = () => {
		toast.success("Número copiado!");
	};

	const getDisplayNumber = () => {
		if (!contact?.number) return "";
		if (hideNum && user.profile === "user") {
			const formatted = formatSerializedId(contact.number);
			return formatted
				? formatted.slice(0, -6) + "**-**" + contact.number.slice(-2)
				: contact.number;
		}
		return formatSerializedId(contact.number) || contact.number;
	};

	if (loading) return null;

	return (
		<>
			<Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="right"
				open={open}
				PaperProps={{ style: { position: "absolute" } }}
				BackdropProps={{ style: { position: "absolute" } }}
				ModalProps={{
					container: document.getElementById("drawer-container"),
					style: { position: "absolute" },
				}}
				classes={{
					paper: classes.drawerPaper,
				}}
			>
				{/* TOP BAR */}
				<div className={classes.topBar}>
					<div className={classes.topBarIcons}>
						<Tooltip title="Mensagens">
							<IconButton className={classes.topBarIcon} size="small">
								<ChatIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Ação rápida">
							<IconButton className={classes.topBarIcon} size="small">
								<FlashOnIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Histórico">
							<IconButton className={classes.topBarIcon} size="small">
								<HistoryIcon fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Configurações">
							<IconButton
								className={classes.topBarIcon}
								size="small"
								onClick={() => setModalOpen(true)}
							>
								<SettingsIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					</div>
					<IconButton className={classes.topBarIcon} size="small" onClick={handleDrawerClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>

				{loading ? (
					<ContactDrawerSkeleton classes={classes} />
				) : (
					<div className={classes.content}>
						{/* PROFILE SECTION */}
						<div className={classes.profileSection}>
							<Tooltip title="Compartilhar contato">
								<IconButton className={classes.shareIcon} size="small">
									<ShareIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						<Avatar
							className={classes.avatar}
							src={contact?.urlPicture}
						>
							{!contact?.urlPicture && <PersonIcon style={{ fontSize: 50 }} />}
						</Avatar>
						<Typography
							variant="h6"
							style={{
								fontWeight: 600,
								fontSize: 16,
								textAlign: "center",
								wordBreak: "break-word",
							}}
						>
							{contact?.name || ""}
						</Typography>
						<div className={classes.phoneRow}>
							<Typography className={classes.phoneNumber}>
								{getDisplayNumber()}
							</Typography>
								<CopyToClipboard text={contact?.number || ""} onCopy={handleCopy}>
									<Tooltip title="Copiar número">
										<IconButton className={classes.copyIcon} size="small">
											<FileCopyIcon style={{ fontSize: 16 }} />
										</IconButton>
									</Tooltip>
								</CopyToClipboard>
							</div>
						</div>

						<Tabs
							value={activeTab}
							onChange={(_, v) => setActiveTab(v)}
							indicatorColor="primary"
							textColor="primary"
							variant="fullWidth"
							className={classes.tabsRoot}
						>
							<Tab label="Contato" className={classes.tab} />
							<Tab label="Ticket" className={classes.tab} />
							<Tab label="Processos" className={classes.tab} />
						</Tabs>

						{/* ===== ABA 0: DETALHES DO CONTATO ===== */}
						{activeTab === 0 && (
						<div className={classes.formSection}>
							<Typography className={classes.sectionTitle}>
								Dados do Contato
							</Typography>

							{/* Nome */}
							<div className={classes.fieldRow}>
								<TextField
									label="Nome"
									value={formData.name}
									onChange={(e) => handleFieldChange("name", e.target.value)}
									variant="outlined"
									size="small"
									fullWidth
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<CreateIcon style={{ fontSize: 16, color: "#aaa" }} />
											</InputAdornment>
										),
									}}
								/>
							</div>

							{/* Email */}
							<TextField
								label="Email"
								value={formData.email}
								onChange={(e) => handleFieldChange("email", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								placeholder="Digite o email do contato"
							/>

							{/* País */}
							<TextField
								label="País"
								value={formData.country}
								onChange={(e) => handleFieldChange("country", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								placeholder="Digite o País do contato"
							/>

							{/* Cidade */}
							<TextField
								label="Cidade"
								value={formData.city}
								onChange={(e) => handleFieldChange("city", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								placeholder="Digite a cidade do contato"
							/>

							{/* Estado */}
							<div className={classes.fieldRow}>
								<TextField
									label="Estado"
									value={formData.state}
									onChange={(e) => handleFieldChange("state", e.target.value)}
									variant="outlined"
									size="small"
									fullWidth
									placeholder="Digite o estado do contato"
								/>
							</div>

							{/* Origem do Lead */}
							<FormControl variant="outlined" size="small" fullWidth>
								<InputLabel>Origem do lead</InputLabel>
								<Select
									value={formData.leadOrigin}
									onChange={(e) => handleFieldChange("leadOrigin", e.target.value)}
									label="Origem do lead"
								>
									<MenuItem value="">
										<em>Selecione uma origem</em>
									</MenuItem>
									<MenuItem value="whatsapp">WhatsApp</MenuItem>
									<MenuItem value="facebook">Facebook</MenuItem>
									<MenuItem value="instagram">Instagram</MenuItem>
									<MenuItem value="site">Site</MenuItem>
									<MenuItem value="indicacao">Indicação</MenuItem>
									<MenuItem value="google">Google</MenuItem>
									<MenuItem value="outro">Outro</MenuItem>
								</Select>
							</FormControl>

							<Divider style={{ margin: "4px 0" }} />

							<Typography className={classes.sectionTitle}>
								Datas
							</Typography>

							{/* Data de entrada */}
							<TextField
								label="Data de entrada"
								type="date"
								value={formData.entryDate}
								onChange={(e) => handleFieldChange("entryDate", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>

							{/* Data de saída */}
							<TextField
								label="Data de saída"
								type="date"
								value={formData.exitDate}
								onChange={(e) => handleFieldChange("exitDate", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								InputLabelProps={{ shrink: true }}
							/>

							<Divider style={{ margin: "4px 0" }} />

							<Typography className={classes.sectionTitle}>
								Negócio
							</Typography>

							{/* Valor do Negócio */}
							<div className={classes.fieldRow}>
								<TextField
									label="Valor do Negócio"
									value={formData.dealValue}
									onChange={(e) => handleFieldChange("dealValue", e.target.value)}
									variant="outlined"
									size="small"
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">R$</InputAdornment>
										),
									}}
								/>
							</div>

							{/* Empresa */}
							<TextField
								label="Empresa"
								value={formData.company}
								onChange={(e) => handleFieldChange("company", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								placeholder="Adicione uma empresa"
							/>

							{/* Cargo */}
							<TextField
								label="Cargo"
								value={formData.position}
								onChange={(e) => handleFieldChange("position", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								placeholder="Nome do cargo"
							/>

							<Divider style={{ margin: "4px 0" }} />

							<Typography className={classes.sectionTitle}>
								Produtos de Interesse
							</Typography>

							{/* Produtos */}
							<div className={classes.fieldRow}>
								<TextField
									label="Produto"
									value={formData.productInput}
									onChange={(e) => handleFieldChange("productInput", e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddProduct();
										}
									}}
									variant="outlined"
									size="small"
									fullWidth
									placeholder="Digite um produto de interesse"
								/>
								<Button
									variant="outlined"
									color="primary"
									size="small"
									onClick={handleAddProduct}
									style={{ whiteSpace: "nowrap", minWidth: "auto" }}
								>
									+
								</Button>
							</div>

							{formData.products.length > 0 && (
								<div className={classes.chipContainer}>
									{formData.products.map((product, index) => (
										<span
											key={index}
											className={classes.productChip}
										>
											{product}
											<CloseIcon
												style={{ fontSize: 14, cursor: "pointer" }}
												onClick={() => handleRemoveProduct(index)}
											/>
										</span>
									))}
								</div>
							)}

							<Divider style={{ margin: "4px 0" }} />

							{/* Observações gerais */}
							<Typography className={classes.sectionTitle}>
								Observações
							</Typography>
							<TextField
								value={formData.observation}
								onChange={(e) => handleFieldChange("observation", e.target.value)}
								variant="outlined"
								size="small"
								fullWidth
								multiline
								rows={3}
								placeholder="Digite uma observação"
							/>

							{/* BOTÃO SALVAR TUDO */}
							<Button
								variant="contained"
								color="primary"
								size="small"
								fullWidth
								onClick={handleSaveAllContactFields}
								disabled={saving}
								style={{ marginTop: 8, fontWeight: 600 }}
							>
								{saving ? "Salvando..." : "Salvar Dados do Contato"}
							</Button>
						</div>
						)}

						{/* ===== ABA 1: DETALHES DO TICKET ===== */}
						{activeTab === 1 && (
						<div className={classes.formSection}>
							{/* Etapa Kanban */}
							<Typography className={classes.sectionTitle}>
								Etapa Kanban
							</Typography>
							<TagsKanbanContainer ticket={ticket} />

							<Divider style={{ margin: "4px 0" }} />

							{/* Observações do Ticket */}
							<Typography className={classes.sectionTitle}>
								Observações do Ticket
							</Typography>
							<ContactNotes ticket={ticket} />

							<Divider style={{ margin: "4px 0" }} />

							{/* Info do Ticket */}
							<Typography className={classes.sectionTitle}>
								Informações do Ticket
							</Typography>

							<TextField
								label="Protocolo"
								value={ticket?.id || ""}
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{ readOnly: true }}
							/>

							<TextField
								label="Fila"
								value={ticket?.queue?.name || "Sem fila"}
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{ readOnly: true }}
							/>

							<TextField
								label="Atendente"
								value={ticket?.user?.name || "Sem atendente"}
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{ readOnly: true }}
							/>

							<TextField
								label="Conexão"
								value={ticket?.whatsapp?.name || "—"}
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{ readOnly: true }}
							/>

							<TextField
								label="Status do Ticket"
								value={ticket?.status || "—"}
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{ readOnly: true }}
							/>

							{ticket?.createdAt && (
								<TextField
									label="Criado em"
									value={new Date(ticket.createdAt).toLocaleString("pt-BR")}
									variant="outlined"
									size="small"
									fullWidth
									InputProps={{ readOnly: true }}
								/>
							)}

							{ticket?.updatedAt && (
								<TextField
									label="Última atualização"
									value={new Date(ticket.updatedAt).toLocaleString("pt-BR")}
									variant="outlined"
									size="small"
									fullWidth
									InputProps={{ readOnly: true }}
								/>
							)}
						</div>
						)}

						{/* ===== ABA 2: PROCESSOS ===== */}
						{activeTab === 2 && (
						<div className={classes.formSection}>
							<Typography className={classes.sectionTitle}>
								Processos
							</Typography>
							<Typography variant="caption" color="textSecondary" style={{ marginBottom: 8, display: "block" }}>
								Áreas de trabalho em que este contato participa
							</Typography>

							{loadingProcesses ? (
								<div className={classes.processLoadingRow}>
									<CircularProgress size={24} />
								</div>
							) : contactProcesses.length === 0 ? (
								<Paper variant="outlined" style={{ padding: 20, textAlign: "center", borderRadius: 10 }}>
									<Typography variant="body2" color="textSecondary">
										Este contato não está vinculado a nenhum quadro.
									</Typography>
								</Paper>
							) : (
								<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
									{contactProcesses.map((proc, idx) => {
										const colors = ["#1976d2", "#2e7d32", "#ed6c02", "#9c27b0", "#d32f2f", "#00838f", "#e91e63", "#ff6f00"];
										const bgColor = colors[idx % colors.length];
										const isExpanded = expandedProcess === proc.groupId;
										const tickets = processTickets[proc.groupId] || [];
										const isLoading = loadingProcessTickets[proc.groupId];

										return (
											<div key={proc.groupId || idx}>
												<div
													className={`${classes.processCard} ${classes.processCardClickable}`}
													onClick={() => handleToggleProcess(proc.groupId)}
												>
													<div className={classes.processName}>
														<div
															className={classes.processIcon}
															style={{ backgroundColor: bgColor }}
														>
															{(proc.groupName || "K").charAt(0).toUpperCase()}
														</div>
														<span>{proc.groupName || "Kanban"}</span>
													</div>
													<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
														<div className={classes.processCount}>
															{proc.count}
														</div>
														<ExpandMoreIcon
															className={`${classes.processExpandIcon} ${isExpanded ? classes.processExpandIconOpen : ""}`}
														/>
													</div>
												</div>

												<Collapse in={isExpanded} timeout="auto" unmountOnExit>
													<div className={classes.processTicketsList}>
														{isLoading ? (
															<div className={classes.processLoadingRow}>
																<CircularProgress size={20} />
															</div>
														) : tickets.length === 0 ? (
															<Typography variant="caption" color="textSecondary" style={{ textAlign: "center", padding: "8px 0" }}>
																Nenhum card encontrado
															</Typography>
														) : (
															tickets.map((tk) => (
																<div key={tk.id} className={classes.processTicketItem}>
																	<div className={classes.processTicketThumb}>
																		{tk.capaUrl ? (
																			<img
																				src={resolveImageUrl(tk.capaUrl)}
																				alt=""
																				style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
																				onError={(e) => { e.target.style.display = "none"; }}
																			/>
																		) : tk.contactPic ? (
																			<Avatar
																				src={tk.contactPic}
																				style={{ width: 40, height: 40 }}
																			>
																				<PersonIcon />
																			</Avatar>
																		) : (
																			<PersonIcon style={{ fontSize: 20, color: "#bbb" }} />
																		)}
																	</div>

																	<div className={classes.processTicketInfo}>
																		<div className={classes.processTicketName}>
																			{tk.nomeProjeto || tk.contactName}
																		</div>
																		<div className={classes.processTicketMeta}>
																			<span className={classes.processTicketStatus}>
																				<FiberManualRecordIcon style={{ fontSize: 10, color: getStatusColor(tk.status) }} />
																				{getStatusLabel(tk.status)}
																			</span>
																			{tk.hasMedia && (
																				<span className={classes.processTicketMediaBadge}>
																					<ImageIcon style={{ fontSize: 13 }} />
																					{tk.attachments.length}
																				</span>
																			)}
																			{tk.tagName && (
																				<span style={{ fontSize: 11, color: "#666" }}>
																					· {tk.tagName}
																				</span>
																			)}
																		</div>
																		<div style={{ fontSize: 10, color: "#999", marginTop: 2 }}>
																			{tk.createdAt ? format(parseISO(tk.createdAt), "dd/MM/yyyy") : ""}
																			{tk.valorServico > 0 && (
																				<span style={{ marginLeft: 8, fontWeight: 600, color: "#2e7d32" }}>
																					R$ {Number(tk.valorServico).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
																				</span>
																			)}
																		</div>
																	</div>
																</div>
															))
														)}
													</div>
												</Collapse>
											</div>
										);
									})}
								</div>
							)}

							<Divider style={{ margin: "12px 0" }} />

							<Typography variant="caption" color="textSecondary" style={{ display: "block" }}>
								Total de vínculos: {contactProcesses.reduce((sum, p) => sum + (p.count || 0), 0)}
							</Typography>
						</div>
						)}
					</div>
				)}
			</Drawer>

			<ContactModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				contactId={contact?.id}
			/>
		</>
	);
};

export default ContactDrawer;

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

import ChatIcon from "@material-ui/icons/Chat";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HistoryIcon from "@material-ui/icons/History";
import SettingsIcon from "@material-ui/icons/Settings";
import ShareIcon from "@material-ui/icons/Share";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CreateIcon from "@material-ui/icons/Create";
import PersonIcon from "@material-ui/icons/Person";

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

const drawerWidth = 360;

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

	const handleFieldChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveField = useCallback(
		async (field) => {
			if (!contact?.id) return;
			setSaving(true);

			try {
				let updateData = {};
				let extraInfo = contact.extraInfo ? [...contact.extraInfo] : [];

				if (field === "name") {
					updateData.name = formData.name;
				} else if (field === "email") {
					updateData.email = formData.email;
				} else {
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
					const extraName = extraFieldMap[field];
					if (extraName) {
						const value = field === "products" ? formData.products.join(", ") : formData[field];
						extraInfo = setExtraInfoValue(extraInfo, extraName, value);
						updateData.extraInfo = extraInfo;
					}
				}

				await api.put(`/contacts/${contact.id}`, updateData);
				setEditingField(null);
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
		// Save immediately
		setTimeout(() => {
			handleSaveField("products");
		}, 100);
	};

	const handleRemoveProduct = (index) => {
		const newProducts = formData.products.filter((_, i) => i !== index);
		setFormData((prev) => ({ ...prev, products: newProducts }));
		setTimeout(() => {
			handleSaveField("products");
		}, 100);
	};

	const handleInsertDealValue = () => {
		handleSaveField("dealValue");
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
							<Tab label="Detalhes do Contato" className={classes.tab} />
							<Tab label="Detalhes do Ticket" className={classes.tab} />
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
									onBlur={() => handleSaveField("name")}
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
								onBlur={() => handleSaveField("email")}
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
								onBlur={() => handleSaveField("country")}
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
								onBlur={() => handleSaveField("city")}
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
									onBlur={() => handleSaveField("state")}
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
									onChange={(e) => {
										handleFieldChange("leadOrigin", e.target.value);
										setTimeout(() => handleSaveField("leadOrigin"), 100);
									}}
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
								onBlur={() => handleSaveField("entryDate")}
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
								onBlur={() => handleSaveField("exitDate")}
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
							<Button
								variant="contained"
								color="primary"
								size="small"
								className={classes.valueButton}
								onClick={handleInsertDealValue}
								disabled={saving}
							>
								Inserir Valor
							</Button>

							{/* Empresa */}
							<TextField
								label="Empresa"
								value={formData.company}
								onChange={(e) => handleFieldChange("company", e.target.value)}
								onBlur={() => handleSaveField("company")}
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
								onBlur={() => handleSaveField("position")}
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
							</div>
							<Button
								variant="contained"
								color="primary"
								size="small"
								className={classes.valueButton}
								onClick={handleAddProduct}
							>
								Inserir
							</Button>

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
								onBlur={() => handleSaveField("observation")}
								variant="outlined"
								size="small"
								fullWidth
								multiline
								rows={3}
								placeholder="Digite uma observação"
							/>
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

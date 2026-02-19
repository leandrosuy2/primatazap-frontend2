import React, { useState } from "react";
import { i18n } from "../../translate/i18n";
import { Avatar, CardHeader, Grid, TextField, Input, InputAdornment, InputLabel, Box } from "@material-ui/core";
import PersonOutline from "@material-ui/icons/PersonOutline";
import Edit from "@material-ui/icons/Edit";
import { TagsKanbanContainer } from "../TagsKanbanContainer";

const TicketInfo = ({ contact, ticket, onClick }) => {
	const [amount, setAmount] = useState("");

	const renderCardReader = () => {
		const name = contact?.name || "(sem contato)";
		return (
			<CardHeader
				onClick={onClick}
				style={{ cursor: "pointer" }}
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={<Avatar src={contact?.urlPicture} alt="contact_image" />}
				title={
					<Box component="span" display="flex" alignItems="center" flexWrap="nowrap" gap={0.5}>
						<PersonOutline fontSize="small" style={{ flexShrink: 0, opacity: 0.8 }} />
						<Box component="span" minWidth={0}>{name} #{ticket.id}</Box>
						<Edit fontSize="small" style={{ flexShrink: 0, opacity: 0.7 }} />
					</Box>
				}
				subheader={
					ticket.user &&
					`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
				}

			/>
		);
	}

	const handleChange = (event) => {
		const value = event.target.value;

		setAmount(value);
	}


	return (
		<React.Fragment>
			<Grid container alignItems="center" spacing={10}>
				{/* Conteúdo do contato à esquerda */}
				<Grid item xs={6}>
					{renderCardReader()}
				</Grid>
			</Grid>
		</React.Fragment>
	);
};

export default TicketInfo;

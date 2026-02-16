import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  makeStyles,
  Paper,
  CircularProgress,
  Box,
} from "@material-ui/core";
import Close from "@material-ui/icons/Close";
import { AuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { ForwardMessageProvider } from "../../context/ForwarMessage/ForwardMessageContext";
import { EditMessageProvider } from "../../context/EditingMessage/EditingMessageContext";
import { QueueSelectedProvider } from "../../context/QueuesSelected/QueuesSelectedContext";
import MessagesList from "../../components/MessagesList";
import MessageInput from "../../components/MessageInput";
import TicketInfo from "../../components/TicketInfo";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      maxHeight: "90vh",
      height: "90vh",
      borderRadius: 12,
      [theme.breakpoints.down("sm")]: {
        maxHeight: "100vh",
        height: "100vh",
        borderRadius: 0,
      },
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1, 2),
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    backgroundColor: theme.palette.background.paper,
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    padding: 0,
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 280,
    padding: theme.spacing(3),
  },
}));

export default function KanbanChatModal({ open, onClose, ticketUuid }) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [contact, setContact] = useState(null);
  const [dragDropFiles, setDragDropFiles] = useState([]);

  useEffect(() => {
    if (!open || !ticketUuid) {
      setTicket(null);
      setContact(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchTicket = async () => {
      try {
        const { data } = await api.get("/tickets/u/" + ticketUuid);
        setContact(data.contact || {});
        setTicket(data);
      } catch (err) {
        toastError(err);
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [open, ticketUuid, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      fullScreen={false}
      maxWidth="md"
      fullWidth
    >
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          {!loading && ticket && contact && (
            <TicketInfo
              contact={contact}
              ticket={ticket}
              onClick={onClose}
            />
          )}
          {loading && (
            <Typography variant="body1" color="textSecondary">
              Carregando conversa...
            </Typography>
          )}
        </div>
        <IconButton onClick={onClose} size="small" aria-label="Fechar">
          <Close />
        </IconButton>
      </div>

      <DialogContent className={classes.content}>
        {loading && (
          <Box className={classes.loadingBox}>
            <CircularProgress />
          </Box>
        )}

        {!loading && ticket && contact && (
          <QueueSelectedProvider>
            <ReplyMessageProvider>
              <ForwardMessageProvider>
                <EditMessageProvider>
                  <Paper elevation={0} className={classes.chatArea}>
                    <MessagesList
                      isGroup={ticket.isGroup}
                      onDrop={setDragDropFiles}
                      whatsappId={ticket.whatsappId}
                      queueId={ticket.queueId}
                      channel={ticket.channel}
                      ticketIdProp={ticket.uuid}
                    />
                    <MessageInput
                      ticketId={ticket.id}
                      ticketStatus={ticket.status}
                      ticketChannel={ticket.channel}
                      droppedFiles={dragDropFiles}
                      contactId={contact.id}
                    />
                  </Paper>
                </EditMessageProvider>
              </ForwardMessageProvider>
            </ReplyMessageProvider>
          </QueueSelectedProvider>
        )}
      </DialogContent>
    </Dialog>
  );
}

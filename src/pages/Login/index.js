import React, { useState, useEffect, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, TextField, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton, InputAdornment, Switch } from "@mui/material";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import EmailIcon from "@material-ui/icons/Email";
import LockIcon from "@material-ui/icons/Lock";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
    padding: theme.spacing(2),
    boxSizing: "border-box",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1.5),
      alignItems: "flex-start",
      paddingTop: "min(24px, 5vh)",
    },
  },
  formContainer: {
    width: "100%",
    maxWidth: "440px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)",
    padding: "36px 32px",
    [theme.breakpoints.down("xs")]: {
      padding: "24px 20px",
      maxWidth: "100%",
      borderRadius: "10px",
    },
  },
  logoImg: {
    display: "block",
    margin: "0 auto 20px",
    maxWidth: "120px",
    height: "auto",
    [theme.breakpoints.down("xs")]: {
      maxWidth: "100px",
      marginBottom: "16px",
    },
  },
  title: {
    textAlign: "center",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#1a1a2e",
    fontSize: "1.25rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.1rem",
    },
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#6b7280",
    fontSize: "0.9375rem",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.875rem",
      marginBottom: "20px",
    },
  },
  inputRoot: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 16px",
      fontSize: "1rem",
      [theme.breakpoints.down("xs")]: {
        padding: "12px 14px",
        fontSize: "0.9375rem",
      },
    },
    "& .MuiInputLabel-outlined": {
      fontSize: "1rem",
      [theme.breakpoints.down("xs")]: {
        fontSize: "0.9375rem",
      },
    },
  },
  submitBtn: {
    marginTop: "20px",
    backgroundColor: "#0d9488",
    color: "#fff",
    borderRadius: "8px",
    padding: "14px 24px",
    fontWeight: 600,
    width: "100%",
    textTransform: "none",
    fontSize: "1rem",
    boxShadow: "none",
    minHeight: "48px",
    "&:hover": {
      backgroundColor: "#0f766e",
      boxShadow: "0 2px 8px rgba(13, 148, 136, 0.35)",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "12px 20px",
      fontSize: "0.9375rem",
      marginTop: "16px",
      minHeight: "44px",
    },
  },
  registerBtn: {
    backgroundColor: "transparent",
    color: "#0d9488",
    border: "1px solid #0d9488",
    borderRadius: "8px",
    padding: "14px 24px",
    fontWeight: 600,
    width: "100%",
    textTransform: "none",
    fontSize: "1rem",
    marginTop: "10px",
    minHeight: "48px",
    "&:hover": {
      backgroundColor: "rgba(13, 148, 136, 0.08)",
      borderColor: "#0f766e",
    },
    [theme.breakpoints.down("xs")]: {
      padding: "12px 20px",
      fontSize: "0.9375rem",
      minHeight: "44px",
    },
  },
  forgotPassword: {
    marginTop: "18px",
    textAlign: "center",
  },
  forgotPasswordLink: {
    color: "#6b7280",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    "&:hover": {
      color: "#0d9488",
      textDecoration: "underline",
    },
  },
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "12px",
  },
  rememberMeLabel: {
    fontSize: "0.9375rem",
    color: "#374151",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.875rem",
    },
  },
  whatsappButton: {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    backgroundColor: "#10aa62",
    borderRadius: "50%",
    width: "48px",
    height: "48px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 12px #044012",
    transition: "all 0.3s ease",
    animation: "$bounce 1s infinite",
    cursor: "pointer",
    zIndex: 999,
    "&:hover": {
      backgroundColor: "#10aa62",
      transform: "scale(1.1)",
      boxShadow: "0 8px 16px #05491c",
    },
    [theme.breakpoints.down("xs")]: {
      width: "44px",
      height: "44px",
      bottom: "12px",
      right: "12px",
    },
  },
  whatsappIcon: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    [theme.breakpoints.down("xs")]: {
      width: "40px",
      height: "40px",
    },
  },
  "@keyframes bounce": {
    "0%": {
      transform: "translateY(0)",
    },
    "50%": {
      transform: "translateY(-10px)",
    },
    "100%": {
      transform: "translateY(0)",
    },
  },
}));

const Login = () => {
  const classes = useStyles();
  const { handleLogin } = useContext(AuthContext);
  const [user, setUser] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [userCreationEnabled, setUserCreationEnabled] = useState(true);

  // Determinar a URL do backend
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL === "https://localhost:8090"
      ? "https://localhost:8090"
      : process.env.REACT_APP_BACKEND_URL;

  // Verificar status de userCreation ao carregar o componente
  useEffect(() => {
    const fetchUserCreationStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/settings/userCreation`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user creation status");
        }

        const data = await response.json();
        setUserCreationEnabled(data.userCreation === "enabled");
      } catch (err) {
        console.error("Erro ao verificar userCreation:", err);
        setUserCreationEnabled(false); // Esconder botão em caso de erro
      }
    };

    fetchUserCreationStatus();
  }, [backendUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className={classes.root}>
        <form className={classes.formContainer} onSubmit={handleSubmit}>
          <img src="/logo.png" alt="Logo" className={classes.logoImg} />
          <Typography className={classes.title}>Acesso ao sistema</Typography>
          <Typography className={classes.subtitle}>
            Entre com suas credenciais para continuar
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Email"
              placeholder="seu@email.com"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className={classes.inputRoot}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Senha"
              placeholder="Digite sua senha"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? "text" : "password"}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className={classes.inputRoot}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className={classes.rememberMeContainer}>
              <Switch
                checked={user.remember}
                onChange={(e) => setUser({ ...user, remember: e.target.checked })}
                name="remember"
                sx={{
                  "& .MuiSwitch-thumb": {
                    backgroundColor: user.remember ? "#0d9488" : "#d1d5db",
                  },
                  "& .Mui-checked": {
                    color: "#0d9488",
                  },
                  "& .Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#0d9488",
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: user.remember ? "#0d9488" : "#d1d5db",
                  },
                }}
              />
              <Typography className={classes.rememberMeLabel}>
                Lembrar de mim
              </Typography>
            </div>
            <div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitBtn}
              >
                Entrar
              </Button>
              {userCreationEnabled && (
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  className={classes.registerBtn}
                >
                  Cadastre-se
                </Button>
              )}
            </div>
            <div className={classes.forgotPassword}>
              <RouterLink
                to="/forgot-password"
                className={classes.forgotPasswordLink}
              >
                Esqueceu a senha?
              </RouterLink>
            </div>
        </form>
        <div
          className={classes.whatsappButton}
          onClick={() => window.open("https://wa.me/5541992098329")}
        >
          <img
            src="https://i.ibb.co/1p43y88/iconzapzap.png"
            alt="WhatsApp"
            className={classes.whatsappIcon}
          />
        </div>
      </div>
    </>
  );
};

export default Login;
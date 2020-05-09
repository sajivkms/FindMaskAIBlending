import React from "react";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Dialog from "./HelpDialog"
export default function Header() {
  return (
    <AppBar position="static">
    <Toolbar style={{
      flex:"true",
      justifyContent:"space-between"
    }}>
      <Typography variant="h6">
        AI Poisson Blending
      </Typography>
      <Dialog />
    </Toolbar>
  </AppBar>
  );
}
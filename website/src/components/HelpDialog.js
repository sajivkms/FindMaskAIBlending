import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';
import Divider from "@material-ui/core/Divider"
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow direction="up" ref={ref} {...props} />;
});

export default function AlertDialogGrow() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" color="default" onClick={handleClickOpen}>
        How to use
      </Button>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-Grow-title"
        aria-describedby="alert-dialog-Grow-description"
      >
        <DialogTitle id="alert-dialog-Grow-title">{"Poisson Blending with Artificial Intelligence"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-Grow-description">
            This website uses AI to identify objects in an image and blend it into another image using Poisson Blending.
            <br /><br />
            <Divider />
            <br />
            Follow along with the steps. For steps that have a submit button, make sure that you press the submit button, otherwise it will not work.
            <br></br><br />
            <Divider />
            <br></br>
            <bold>IMPORTANT NOTE: </bold>This site will not work on mobile devices properly.
            <br></br><br />
            <Divider />
            <br></br>
            &copy; 2020 Sajiv Kamalakaran
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Thank you!
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

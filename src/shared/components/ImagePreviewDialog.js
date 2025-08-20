/**
 * ImagePreviewDialog.js
 * Simple modal dialog for previewing an image (e.g., book cover) with a close action.
 */
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

/**
 * Displays an image in a Material UI `Dialog`.
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {string} [props.src] - Image URL to preview. If falsy, content area remains empty.
 * @param {() => void} props.onClose - Handler to close the dialog.
 * @param {string} [props.title='Cover Preview'] - Dialog title text.
 */
const ImagePreviewDialog = ({ open, src, onClose, title = 'Cover Preview' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {src && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img src={src} alt="cover" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImagePreviewDialog;

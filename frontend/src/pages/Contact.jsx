import React from 'react'
import { Typography, Box, Button } from '@mui/material'

export default function Contact() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Contact</Typography>
      <Typography>Get in touch with support or request a demo.</Typography>
      <Button variant="contained" sx={{ mt: 2 }}>Email Support</Button>
    </Box>
  )
}

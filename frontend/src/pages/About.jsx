import React from 'react'
import { Typography, Box } from '@mui/material'

export default function About() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>About</Typography>
      <Typography>
        Rent & Flatmate Finder connects tenants and owners with intelligent matching and chat support.
      </Typography>
    </Box>
  )
}

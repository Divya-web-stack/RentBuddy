import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'

export default function NavBar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#c9b59b', color: '#5a4840' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontFamily: "'Chewy', cursive", fontSize: '28px' }}
        >
          RentBuddy
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">Home</Button>
        <Button color="inherit" component={RouterLink} to="/#how-it-works">How It Works</Button>

        <Button color="inherit" component={RouterLink} to="/listings">Listings</Button>
        <Button color="inherit" component={RouterLink} to="/#about">About</Button>
        <Button color="inherit" component={RouterLink} to="/#contact">Contact</Button>



        {(() => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
          if (token) {
            return (
              <Button
                color="inherit"
                onClick={() => {
                  localStorage.removeItem('access_token')
                  localStorage.removeItem('authUser')
                  window.location.href = '/'
                }}
              >
                Logout
              </Button>
            )
          }

          return (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )
        })()}
      </Toolbar>
    </AppBar>
  )
}

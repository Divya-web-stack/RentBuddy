import React, { useState } from 'react'
import axios from 'axios'
import { TextField, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

    axios
      .post(`${API_BASE_URL}/login`, {
        email,
        password,
        // backend expects full_name in schema; keep empty string if not used
        full_name: '',
      })
      .then((res) => {
        if (res.data?.access_token && res.data?.user) {
          localStorage.setItem('access_token', res.data.access_token)
          localStorage.setItem('authUser', JSON.stringify(res.data.user))
        }
        navigate('/dashboard')
      })
      .catch((err) => {
        console.error('login failed', err?.response?.data || err.message)
      })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
      <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" fullWidth margin="normal" />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Login</Button>
    </Box>
  )
}

import React, { useState } from 'react'
import { TextField, Button, Box, Typography, Alert } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
      const res = await axios.post(`${API_BASE_URL}/register`, {
        email,
        password,
        full_name: name,
      })

      if (res.data?.access_token && res.data?.user) {
        localStorage.setItem('access_token', res.data.access_token)
        localStorage.setItem('authUser', JSON.stringify(res.data.user))
      }

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Create an Account
      </Typography>
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      <TextField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
      <TextField label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" fullWidth margin="normal" />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </Button>
    </Box>
  )
}

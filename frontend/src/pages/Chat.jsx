import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box, Typography, Button } from '@mui/material'
import '../styles/Chat.css'


export default function Chat() {
  const { roomId } = useParams()

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const WS_BASE_URL = useMemo(() => {
    // API_BASE_URL looks like: http://localhost:8000/api/v1
    // We need: ws://localhost:8000/api/v1
    if (!API_BASE_URL) return 'ws://localhost:8000/api/v1'
    return API_BASE_URL.replace(/^http(s)?:\/\//i, (match, p1) => {
      return 'ws://'
    })
  }, [API_BASE_URL])

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('authUser')
      if (!raw) return NaN
      const parsed = JSON.parse(raw)
      return Number(parsed?.id)
    } catch {
      return NaN
    }
  }, [])


  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState('')
  const [wsConnected, setWsConnected] = useState(false)

  const bottomRef = useRef(null)
  const wsRef = useRef(null)

  const appendMessage = (msg) => {
    setMessages((prev) => {
      // Avoid accidental duplicates when backend broadcasts back the same message.
      // If backend sends unique ids, we can dedupe by id.
      if (msg?.id !== undefined && msg?.id !== null) {
        if (prev.some((m) => m.id === msg.id)) return prev
      }
      return [...prev, msg]
    })
  }

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setLoadingHistory(true)
      try {
        const url = `${API_BASE_URL}/chat/${roomId}/messages`
        const res = await axios.get(url)
        if (cancelled) return
        setMessages(res.data || [])
      } catch (err) {
        console.error('Failed to load chat history:', err?.response?.data || err.message)
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [API_BASE_URL, roomId])

  useEffect(() => {
    if (!roomId) return

    if (!token) {
      // If not logged in, still allow viewing history results (if any), but disable sending.
      setWsConnected(false)
      return
    }

    const wsUrl = `${WS_BASE_URL}/chat/ws/${roomId}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        appendMessage(data)
      } catch (e) {
        console.error('Failed to parse incoming WS message:', e)
      }
    }

    ws.onerror = () => {
      setWsConnected(false)
    }

    ws.onclose = () => {
      setWsConnected(false)
    }

    return () => {
      try {
        ws.close()
      } catch {
        // ignore
      }
    }
  }, [WS_BASE_URL, roomId, token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const handleSend = () => {
    const text = sending.trim()
    if (!text) return
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    // Format required by backend:
    // {
    //   "token": localStorage.getItem("access_token"),
    //   "text": message
    // }
    const payload = {
      token: localStorage.getItem('access_token'),
      text,
    }

    try {
      wsRef.current.send(JSON.stringify(payload))
      setSending('')
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  const canSend = wsConnected && sending.trim().length > 0

  return (
    <Box className="chat-page">
      <Box className="chat-header">
        <Typography variant="h6" className="chat-title">
          Chat
        </Typography>
        <Typography variant="body2" className="chat-subtitle">
          Room ID: {roomId}
        </Typography>
      </Box>

      <Box className="chat-body">
        {loadingHistory ? (
          <Typography className="chat-status">Loading messages...</Typography>
        ) : messages.length === 0 ? (
          <Typography className="chat-status">No messages yet</Typography>
        ) : (
          <div className="chat-messages">
            {messages.map((m) => {
              const isCurrentUser = Number(m.sender_id) === currentUserId
              return (
                <div
                  key={m.id ?? `${m.sender_id}-${m.created_at}-${m.text}`}
                  className={`chat-message-row ${isCurrentUser ? 'right' : 'left'}`}
                >
                  <div className={`chat-bubble ${isCurrentUser ? 'mine' : 'theirs'}`}>
                    <Typography className="chat-bubble-text">{m.text}</Typography>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </Box>

      <Box className="chat-input-bar" component="form" onSubmit={(e) => e.preventDefault()}>
        <input
          className="chat-input"
          value={sending}
          onChange={(e) => setSending(e.target.value)}
          placeholder={wsConnected ? 'Type a message...' : 'Connecting...'}
          disabled={!wsConnected}
        />
        <Button
          className="chat-send"
          variant="contained"
          disabled={!canSend}
          onClick={handleSend}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}


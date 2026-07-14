import React, { useEffect, useState } from 'react'
import { Box, Button, Grid, Paper, Typography, Divider, Chip, Stack } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const [listings, setListings] = useState([])

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/listings`)
        setListings(response.data || [])
      } catch (error) {
        console.error('Failed to fetch listings', error)
      }
    }

    fetchListings()
  }, [API_BASE_URL])

  return (
    <Box sx={{ px: 3, py: 6 }}>
      <Box sx={{ maxWidth: 820, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
          Welcome, Divya 👋
        </Typography>
        <Typography sx={{ color: '#5a4840', mb: 4 }}>
          What would you like to do?
        </Typography>

        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
          <Grid container direction="column" spacing={3}>
            <Grid item>
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>🔍 Find a Flat</Typography>
                <Typography sx={{ color: '#6c5c53', mb: 2 }}>Browse Listings</Typography>
              </Box>
            </Grid>

            <Grid item>
              <Divider />
            </Grid>

            <Grid item>
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>🏡 List a Property</Typography>
                <Typography sx={{ color: '#6c5c53', mb: 2 }}>Post a Room</Typography>
              </Box>
            </Grid>

            <Grid item>
              <Divider />
            </Grid>

            <Grid item>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}>
                <Button variant="contained" sx={{ minWidth: 220, height: 52 }} onClick={() => navigate('/listings')}>
                  Browse Listings
                </Button>
                <Button variant="outlined" sx={{ minWidth: 220, height: 52 }} onClick={() => navigate('/listings/new')}>
                  Post a Room
                </Button>
              </Box>
            </Grid>

            <Grid item>
              <Divider />
            </Grid>

            <Grid item>
              <Box sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1 }}>Recent Matches</Typography>
                <Typography sx={{ color: '#6c5c53', mb: 2 }}>Latest listings and their AI compatibility scores.</Typography>
                {listings.length === 0 ? (
                  <Typography sx={{ color: '#6c5c53' }}>No listings have been posted yet.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {listings.slice(0, 5).map((listing) => (
                      <Paper key={listing.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography sx={{ fontWeight: 700 }}>{listing.title}</Typography>
                        <Typography sx={{ color: '#6c5c53', fontSize: 14, mb: 1 }}>{listing.description || 'No description'}</Typography>

                        {/* AI explanation (reason) for the top match */}
                        {(listing.match_scores || []).length > 0 && (
                          <Typography sx={{ color: '#5a4840', fontSize: 13, mb: 1 }}>
                            {(listing.match_scores[0]?.reason) || 'AI evaluated this listing as a good match based on your saved preferences.'}
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {(listing.match_scores || []).slice(0, 3).map((match, index) => (
                            <Chip
                              key={`${listing.id}-${match.profile_id || index}`}
                              label={`${match.full_name || 'Profile'} • ${match.score}%`}
                              color={match.score >= 70 ? 'success' : match.score >= 40 ? 'warning' : 'default'}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  )
}

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
} from '@mui/material'

const PROPERTY_TYPES = ['Apartment', 'House', 'PG', 'Studio']
const ROOM_TYPES = ['Private Room', 'Shared Room', 'Entire Property']
const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished']
const AMENITIES = ['WiFi', 'AC', 'Parking', 'Washing Machine', 'Kitchen', 'Lift', 'Gym']
const GENDER_OPTIONS = ['Male', 'Female', 'No Preference']
const OCCUPATION_OPTIONS = ['Student', 'Working Professional', 'Freelancer', 'No Preference']
const YES_NO = ['Yes', 'No', "Doesn't Matter"]
const FOOD_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', "Doesn't Matter"]
const PET_OPTIONS = ['Okay with Pets', 'No Pets', "Doesn't Matter"]

export default function Listings() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const [city, setCity] = useState(() => localStorage.getItem('listing_pref_city') || 'Pune')
  const [area, setArea] = useState(() => localStorage.getItem('listing_pref_area') || 'Baner')
  const [minBudget, setMinBudget] = useState(() => localStorage.getItem('listing_pref_minBudget') || '8000')
  const [maxBudget, setMaxBudget] = useState(() => localStorage.getItem('listing_pref_maxBudget') || '12000')
  const [moveInDate, setMoveInDate] = useState(() => localStorage.getItem('listing_pref_moveInDate') || '2026-08-15')
  const [propertyType, setPropertyType] = useState(() => localStorage.getItem('listing_pref_propertyType') || 'Apartment')
  const [roomType, setRoomType] = useState(() => localStorage.getItem('listing_pref_roomType') || 'Private Room')
  const [furnishing, setFurnishing] = useState(() => localStorage.getItem('listing_pref_furnishing') || 'Fully Furnished')
  const [amenities, setAmenities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('listing_pref_amenities') || '[]')
    } catch {
      return []
    }
  })
  const [genderPreference, setGenderPreference] = useState(() => localStorage.getItem('listing_pref_genderPreference') || 'No Preference')
  const [occupation, setOccupation] = useState(() => localStorage.getItem('listing_pref_occupation') || 'No Preference')
  const [smoking, setSmoking] = useState(() => localStorage.getItem('listing_pref_smoking') || "Doesn't Matter")
  const [drinking, setDrinking] = useState(() => localStorage.getItem('listing_pref_drinking') || "Doesn't Matter")
  const [foodPreference, setFoodPreference] = useState(() => localStorage.getItem('listing_pref_foodPreference') || "Doesn't Matter")
  const [pets, setPets] = useState(() => localStorage.getItem('listing_pref_pets') || "Doesn't Matter")
  const [lifestyle, setLifestyle] = useState(() => localStorage.getItem('listing_pref_lifestyle') || '')
  const [cleanliness, setCleanliness] = useState(() => Number(localStorage.getItem('listing_pref_cleanliness') || 3))
  const [noise, setNoise] = useState(() => localStorage.getItem('listing_pref_noise') || 'Neutral')
  const [workFromHome, setWorkFromHome] = useState(() => localStorage.getItem('listing_pref_workFromHome') === 'true')
  const [guests, setGuests] = useState(() => localStorage.getItem('listing_pref_guests') === 'true')
  const [languages, setLanguages] = useState(() => localStorage.getItem('listing_pref_languages') || 'English')

  const [results, setResults] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [publishedListings, setPublishedListings] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [listingsError, setListingsError] = useState('')
  const [matchResults, setMatchResults] = useState([])
  const [isMatching, setIsMatching] = useState(false)
  const [matchError, setMatchError] = useState('')
  const [interestStatus, setInterestStatus] = useState('')
  const [isSendingInterest, setIsSendingInterest] = useState(false)

  useEffect(() => {
    // If user previously searched, avoid re-filling the form and show ranked listings immediately.
    const hasSavedPrefs = !!localStorage.getItem('listing_pref_city')
    if (hasSavedPrefs && !results) {
      const payload = {
        preferences: {
          city: localStorage.getItem('listing_pref_city') || city,
          area: localStorage.getItem('listing_pref_area') || area,
          budget: `₹${localStorage.getItem('listing_pref_minBudget') || minBudget} — ₹${localStorage.getItem('listing_pref_maxBudget') || maxBudget}`,
          moveInDate: localStorage.getItem('listing_pref_moveInDate') || moveInDate,
          propertyType: localStorage.getItem('listing_pref_propertyType') || propertyType,
          roomType: localStorage.getItem('listing_pref_roomType') || roomType,
          furnishing: localStorage.getItem('listing_pref_furnishing') || furnishing,
          amenities: JSON.parse(localStorage.getItem('listing_pref_amenities') || '[]'),
          flatmatePreferences: {
            genderPreference: localStorage.getItem('listing_pref_genderPreference') || genderPreference,
            occupation: localStorage.getItem('listing_pref_occupation') || occupation,
            smoking: localStorage.getItem('listing_pref_smoking') || smoking,
            drinking: localStorage.getItem('listing_pref_drinking') || drinking,
            foodPreference: localStorage.getItem('listing_pref_foodPreference') || foodPreference,
            pets: localStorage.getItem('listing_pref_pets') || pets,
          },
          lifestyle: {
            lifestyle: localStorage.getItem('listing_pref_lifestyle') || lifestyle,
            cleanliness: Number(localStorage.getItem('listing_pref_cleanliness') || cleanliness),
            noise: localStorage.getItem('listing_pref_noise') || noise,
            workFromHome: localStorage.getItem('listing_pref_workFromHome') === 'true',
            guests: localStorage.getItem('listing_pref_guests') === 'true',
            languages: localStorage.getItem('listing_pref_languages') || languages,
          },
        },
      }

      // Trigger search+match using saved prefs
      ;(async () => {
        try {
          setIsMatching(true)
          setMatchError('')
          const matchResponse = await axios.post(`${API_BASE_URL}/listings/match`, payload)
          setMatchResults(matchResponse.data?.matches || [])
        } catch (error) {
          setMatchError('Matching could not be completed right now. Please try again.')
        } finally {
          setIsMatching(false)
        }
      })()
    }

    let active = true

    const loadListings = async () => {

      setIsLoadingListings(true)
      setListingsError('')

      try {
        const response = await axios.get(`${API_BASE_URL}/listings`)
        if (!active) return

        const items = response.data || []
        setPublishedListings(items)
        if (items.length > 0 && !selectedListing) {
          setSelectedListing(items[0])
        }
      } catch (error) {
        if (active) {
          setListingsError('Listings could not be loaded right now.')
        }
      } finally {
        if (active) {
          setIsLoadingListings(false)
        }
      }
    }

    loadListings()
    return () => {
      active = false
    }
  }, [API_BASE_URL])

  const toggleAmenity = (amenity) => {
    setAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    )
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus('')

    const payload = {
      preferences: {
        city,
        area,
        budget: `₹${minBudget} — ₹${maxBudget}`,
        moveInDate,
        propertyType,
        roomType,
        furnishing,
        amenities,
        flatmatePreferences: { genderPreference, occupation, smoking, drinking, foodPreference, pets },
        lifestyle: { lifestyle, cleanliness, noise, workFromHome, guests, languages },
      },
    }

    // Persist preferences so user doesn't have to re-fill after login/refresh
    try {
      localStorage.setItem('listing_pref_city', city)
      localStorage.setItem('listing_pref_area', area)
      localStorage.setItem('listing_pref_minBudget', minBudget)
      localStorage.setItem('listing_pref_maxBudget', maxBudget)
      localStorage.setItem('listing_pref_moveInDate', moveInDate)
      localStorage.setItem('listing_pref_propertyType', propertyType)
      localStorage.setItem('listing_pref_roomType', roomType)
      localStorage.setItem('listing_pref_furnishing', furnishing)
      localStorage.setItem('listing_pref_amenities', JSON.stringify(amenities))
      localStorage.setItem('listing_pref_genderPreference', genderPreference)
      localStorage.setItem('listing_pref_occupation', occupation)
      localStorage.setItem('listing_pref_smoking', smoking)
      localStorage.setItem('listing_pref_drinking', drinking)
      localStorage.setItem('listing_pref_foodPreference', foodPreference)
      localStorage.setItem('listing_pref_pets', pets)
      localStorage.setItem('listing_pref_lifestyle', lifestyle)
      localStorage.setItem('listing_pref_cleanliness', String(cleanliness))
      localStorage.setItem('listing_pref_noise', noise)
      localStorage.setItem('listing_pref_workFromHome', String(workFromHome))
      localStorage.setItem('listing_pref_guests', String(guests))
      localStorage.setItem('listing_pref_languages', languages)
    } catch {
      // ignore storage errors
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setSaveStatus('Please login to save preferences.')
        setMatchError('')
        return
      }
      const headers = { Authorization: `Bearer ${token}` }
      const response = await axios.post(`${API_BASE_URL}/profiles`, payload, { headers })
      setResults({

        city,
        area,
        budget: `₹${minBudget} — ₹${maxBudget}`,
        moveInDate,
        propertyType,
        roomType,
        furnishing,
        amenities,
        preferences: { genderPreference, occupation, smoking, drinking, foodPreference, pets },
        lifestyle: { lifestyle, cleanliness, noise, workFromHome, guests, languages },
      })
      setSaveStatus(response.data?.message || 'Preferences saved successfully')


      setIsMatching(true)
      setMatchError('')
      const matchResponse = await axios.post(`${API_BASE_URL}/listings/match`, payload)
      setMatchResults(matchResponse.data?.matches || [])
    } catch (error) {

      console.error('Failed to save browse preferences:', error)
      setSaveStatus('Preferences could not be saved right now. Please try again.')
      setMatchError('Matching could not be completed right now. Please try again.')
    } finally {
      setIsSaving(false)
      setIsMatching(false)
    }
  }

  return (
    <Box sx={{ px: 4, py: 5, maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Find a Flat
      </Typography>
      <Typography sx={{ color: '#5a4840', mb: 4 }}>
        Basic search and optional flatmate preferences to improve AI matching.
      </Typography>

      <Paper sx={{ p: 4, borderRadius: 3, mb: 4 }} elevation={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Published Listings
            </Typography>
            <Typography sx={{ color: '#5a4840' }}>
              Click a card to view the full details for that listing.
            </Typography>
          </Box>
        </Box>

        {isLoadingListings ? (
          <Typography sx={{ color: '#5a4840' }}>Loading published listings...</Typography>
        ) : listingsError ? (
          <Typography sx={{ color: 'error.main' }}>{listingsError}</Typography>
        ) : publishedListings.length === 0 ? (
          <Typography sx={{ color: '#5a4840' }}>No listings have been published yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {publishedListings.map((listing) => (
              <Grid item xs={12} md={6} key={listing.id}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
                  <CardActionArea onClick={() => setSelectedListing(listing)} sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>{listing.title}</Typography>
                        <Chip label="Published" color="success" size="small" />
                      </Box>
                      <Typography sx={{ color: '#6c5c53', mb: 1, minHeight: 44 }}>
                        {listing.description || 'No description provided yet.'}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1.5 }}>
                        <Chip label={`${listing.city || 'Unknown city'}`} size="small" variant="outlined" />
                        <Chip label={`${listing.property_type || 'Property'}`} size="small" variant="outlined" />
                        <Chip label={`₹${listing.monthly_rent || 'N/A'}/month`} size="small" variant="outlined" />
                      </Stack>
                      <Typography sx={{ color: '#5a4840', fontSize: 14 }}>
                        {listing.area ? `${listing.area} • ` : ''}{listing.room_type || 'Room'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

            {selectedListing && (
          <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {selectedListing.title}
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isSendingInterest || !selectedListing?.id}
                  onClick={async () => {
                    const token = localStorage.getItem('access_token')
                    if (!token) {
                      setInterestStatus('Please login to send interest.')
                      return
                    }

                    setIsSendingInterest(true)
                    setInterestStatus('')
                    try {
                      await axios.post(
                            `${API_BASE_URL}/listings/${selectedListing.id}/interest`,
                            null,

                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      )
                      setInterestStatus('Interest request email sent successfully.')
                    } catch (error) {
                      setInterestStatus(error?.response?.data?.detail || 'Failed to send interest. Please try again.')
                    } finally {
                      setIsSendingInterest(false)
                    }
                  }}
                >
                  {isSendingInterest ? 'Sending...' : 'Interested'}
                </Button>
                {interestStatus ? (
                  <Typography sx={{ mt: 1, color: interestStatus.includes('successfully') ? 'success.main' : 'error.main', fontSize: 13 }}>
                    {interestStatus}
                  </Typography>
                ) : null}
              </Box>
            </Box>

            <Typography sx={{ color: '#6c5c53', mb: 2 }}>
              {selectedListing.description || 'No description provided yet.'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700 }}>Location</Typography>
                <Typography>{selectedListing.city || 'N/A'}{selectedListing.area ? `, ${selectedListing.area}` : ''}</Typography>
                <Typography>{selectedListing.address || 'Address not provided'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700 }}>Rent</Typography>
                <Typography>Monthly: ₹{selectedListing.monthly_rent || 'N/A'}</Typography>
                <Typography>Deposit: ₹{selectedListing.security_deposit || 'N/A'}</Typography>
                <Typography>Maintenance included: {selectedListing.maintenance_included ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700 }}>Room details</Typography>
                <Typography>Bedrooms: {selectedListing.bedrooms || 'N/A'}</Typography>
                <Typography>Bathrooms: {selectedListing.bathrooms || 'N/A'}</Typography>
                <Typography>Vacancy: {selectedListing.vacancy || 'N/A'}</Typography>
                <Typography>Furnishing: {selectedListing.furnishing || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 700 }}>Availability</Typography>
                <Typography>Available from: {selectedListing.available_from || 'N/A'}</Typography>
                <Typography>Lease duration: {selectedListing.lease_duration || 'N/A'}</Typography>
                <Typography>Property type: {selectedListing.property_type || 'N/A'}</Typography>
                <Typography>Room type: {selectedListing.room_type || 'N/A'}</Typography>
              </Grid>
            </Grid>
            {selectedListing.amenities && selectedListing.amenities.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Amenities</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {selectedListing.amenities.map((amenity) => (
                    <Chip key={amenity} label={amenity} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}
      </Paper>

      <Box component="form" onSubmit={handleSearch} sx={{ display: 'grid', gap: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Basic Search
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Preferred Location</Typography>
              <TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth sx={{ mb: 2 }} />
              <TextField label="Area / Locality" value={area} onChange={(e) => setArea(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Budget</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Min Rent" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Max Rent" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} fullWidth />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Move-in Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="property-type-label">Property Type</InputLabel>
                <Select
                  labelId="property-type-label"
                  value={propertyType}
                  label="Property Type"
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="room-type-label">Room Type</InputLabel>
                <Select
                  labelId="room-type-label"
                  value={roomType}
                  label="Room Type"
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="furnishing-label">Furnishing</InputLabel>
                <Select
                  labelId="furnishing-label"
                  value={furnishing}
                  label="Furnishing"
                  onChange={(e) => setFurnishing(e.target.value)}
                >
                  {FURNISHING_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Amenities</Typography>
                <FormGroup row>
                  {AMENITIES.map((amenity) => (
                    <FormControlLabel
                      key={amenity}
                      control={<Checkbox checked={amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />}
                      label={amenity}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Flatmate Preferences (optional)
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="gender-pref-label">Gender Preference</InputLabel>
                <Select
                  labelId="gender-pref-label"
                  value={genderPreference}
                  label="Gender Preference"
                  onChange={(e) => setGenderPreference(e.target.value)}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="occupation-pref-label">Occupation</InputLabel>
                <Select
                  labelId="occupation-pref-label"
                  value={occupation}
                  label="Occupation"
                  onChange={(e) => setOccupation(e.target.value)}
                >
                  {OCCUPATION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="smoking-label">Smoking</InputLabel>
                <Select labelId="smoking-label" value={smoking} label="Smoking" onChange={(e) => setSmoking(e.target.value)}>
                  {YES_NO.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="drinking-label">Drinking</InputLabel>
                <Select labelId="drinking-label" value={drinking} label="Drinking" onChange={(e) => setDrinking(e.target.value)}>
                  {YES_NO.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="food-label">Food Preference</InputLabel>
                <Select labelId="food-label" value={foodPreference} label="Food Preference" onChange={(e) => setFoodPreference(e.target.value)}>
                  {FOOD_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="pets-label">Pets</InputLabel>
                <Select labelId="pets-label" value={pets} label="Pets" onChange={(e) => setPets(e.target.value)}>
                  {PET_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Lifestyle (Optional)
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField label="Early Sleeper / Night Owl" value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                label="Cleanliness Level"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                value={cleanliness}
                onChange={(e) => setCleanliness(Number(e.target.value))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField label="Noise Preference" value={noise} onChange={(e) => setNoise(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={<Checkbox checked={workFromHome} onChange={(e) => setWorkFromHome(e.target.checked)} />}
                label="Work From Home"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControlLabel
                control={<Checkbox checked={guests} onChange={(e) => setGuests(e.target.checked)} />}
                label="Guests Frequently"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Languages Spoken" value={languages} onChange={(e) => setLanguages(e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography sx={{ color: '#5a4840' }}>Find Matches</Typography>
          <Button type="submit" variant="contained" sx={{ minWidth: 180 }} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Search'}
          </Button>
        </Box>
      </Box>

      {results && (
        <Paper sx={{ mt: 4, p: 4, borderRadius: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Your Matches
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Search Applied</Typography>
          {saveStatus && (
            <Typography sx={{ mb: 2, color: saveStatus.includes('could not') ? 'error.main' : 'success.main' }}>
              {saveStatus}
            </Typography>
          )}
          {matchError ? (
            <Typography sx={{ color: 'error.main', mb: 2 }}>{matchError}</Typography>
          ) : null}
          <Typography sx={{ mb: 2 }}>Here are the published listings ranked for your profile using the compatibility logic and your saved preferences.</Typography>
          {isMatching ? (
            <Typography sx={{ color: '#5a4840' }}>Ranking listings for you...</Typography>
          ) : matchResults.length === 0 ? (
            <Typography sx={{ color: '#5a4840' }}>No matching listings available yet.</Typography>
          ) : (
            <Stack spacing={2}>
              {matchResults.map((item, index) => (
                <Paper key={item.listing.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{index + 1}. {item.listing.title}</Typography>
                    <Chip label={`${item.score}% compatible`} color={item.score >= 70 ? 'success' : item.score >= 40 ? 'warning' : 'default'} />
                  </Box>
                  <Typography sx={{ color: '#6c5c53', mt: 1 }}>{item.listing.description || 'No description provided.'}</Typography>
                  <Typography sx={{ color: '#5a4840', fontSize: 14, mt: 1 }}>
                    {item.listing.city || 'Unknown city'}{item.listing.area ? `, ${item.listing.area}` : ''} • ₹{item.listing.monthly_rent || 'N/A'}/month
                  </Typography>
                  <Typography sx={{ color: '#5a4840', fontSize: 14, mt: 1 }}>
                    {item.reason}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(item.listing.amenities || []).slice(0, 6).map((amenity) => (
                        <Chip key={`${item.listing.id}-${amenity}`} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={isSendingInterest || !item?.listing?.id}
                      title={!localStorage.getItem('access_token') ? 'Login required' : ''}

                      onClick={async () => {
                        const token = localStorage.getItem('access_token')
                        if (!token) {
                          setInterestStatus('Please login to send interest.')
                          return
                        }

                        setIsSendingInterest(true)
                        setInterestStatus('')
                        try {
                          await axios.post(
                            `${API_BASE_URL}/listings/${item.listing.id}/interest`,
                            {},
                            {
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          )
                          setInterestStatus('Interest request email sent successfully.')
                        } catch (error) {
                          setInterestStatus(error?.response?.data?.detail || 'Failed to send interest. Please try again.')
                        } finally {
                          setIsSendingInterest(false)
                        }
                      }}
                    >
                      {isSendingInterest ? 'Sending...' : 'Interested'}
                    </Button>
                  </Box>
                </Paper>

              ))}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  )
}

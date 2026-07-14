import React, { useState } from 'react'
import axios from 'axios'
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Grid,
  Chip,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

const PROPERTY_TYPES = ['Apartment', 'House', 'PG', 'Studio']
const ROOM_TYPES = ['Private Room', 'Shared Room', 'Entire Property']
const AMENITIES = ['WiFi', 'AC', 'Washing Machine', 'Kitchen', 'Refrigerator', 'Parking', 'Lift', 'Gym', 'Security']

export default function PostProperty() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  const [listingType, setListingType] = useState('owner')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyType, setPropertyType] = useState('Apartment')
  const [roomType, setRoomType] = useState('Private Room')
  const [city, setCity] = useState('')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [mapsLocation, setMapsLocation] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(false)
  const [availableFrom, setAvailableFrom] = useState('')
  const [leaseDuration, setLeaseDuration] = useState('')
  const [bedrooms, setBedrooms] = useState(1)
  const [bathrooms, setBathrooms] = useState(1)
  const [vacancy, setVacancy] = useState(1)
  const [furnishing, setFurnishing] = useState('Furnished')
  const [amenities, setAmenities] = useState([])

  // Tenant-specific
  const [currentOccupants, setCurrentOccupants] = useState(0)
  const [lookingFor, setLookingFor] = useState(1)
  const [aboutFlatmates, setAboutFlatmates] = useState('')
  const [reasonAvailable, setReasonAvailable] = useState('')

  // Preferred flatmate
  const [preferredOccupation, setPreferredOccupation] = useState('No Preference')
  const [preferredGender, setPreferredGender] = useState('No Preference')
  const [preferredAgeRange, setPreferredAgeRange] = useState('18-35')
  const [smokingPreference, setSmokingPreference] = useState('No')
  const [drinkingPreference, setDrinkingPreference] = useState('No')
  const [petsAllowed, setPetsAllowed] = useState('No')
  const [foodPreference, setFoodPreference] = useState('No Preference')

  // Photos
  const [photos, setPhotos] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)

  const navigate = useNavigate()

  function toggleAmenity(name) {
    setAmenities((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]))
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files || [])
    const all = [...photos, ...files].slice(0, 10)
    setPhotos(all)
    if (coverIndex >= all.length) setCoverIndex(0)
  }

  function removePhoto(idx) {
    const next = photos.filter((_, i) => i !== idx)
    setPhotos(next)
    if (coverIndex >= next.length) setCoverIndex(0)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const normalizedListingType = listingType === 'tenant' ? 'TENANT' : listingType === 'manager' ? 'ADMIN' : 'OWNER'

    const payload = {
      listing_type: normalizedListingType,
      title,
      description,
      propertyType,
      roomType,
      location: { city, area, address, mapsLocation },
      rent: { monthly: monthlyRent, securityDeposit, maintenanceIncluded },
      availability: { availableFrom, leaseDuration },
      roomDetails: { bedrooms, bathrooms, vacancy, furnishing },
      amenities,
      preferred: { preferredOccupation, preferredGender, preferredAgeRange, smokingPreference, drinkingPreference, petsAllowed, foodPreference },
      tenantInfo: listingType === 'tenant' ? { currentOccupants, lookingFor, aboutFlatmates, reasonAvailable } : undefined,
      photos: photos.map((f) => f.name || f),
      coverIndex,
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/listings`, payload)
      console.log('publish listing', response.data)
      navigate('/listings')
    } catch (error) {
      console.error('Failed to save listing:', error)
      alert('Listing could not be saved. Please try again.')
    }
  }

  return (
    <Box sx={{ maxWidth: 980, mx: 'auto', px: 3, py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Create Listing
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Who are you posting this listing as?</Typography>
          <RadioGroup
            row
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            name="listing-type"
          >
            <FormControlLabel value="owner" control={<Radio />} label="Property Owner" />
            <FormControlLabel value="tenant" control={<Radio />} label="Current Tenant / Flatmate" />
            <FormControlLabel value="manager" control={<Radio />} label="Property Manager (optional)" />
          </RadioGroup>
        </Box>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Property Information</Typography>
        <TextField label="Listing Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={4} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="property-type-label">Property Type</InputLabel>
              <Select labelId="property-type-label" value={propertyType} label="Property Type" onChange={(e) => setPropertyType(e.target.value)}>
                {PROPERTY_TYPES.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="room-type-label">Room Type</InputLabel>
              <Select labelId="room-type-label" value={roomType} label="Room Type" onChange={(e) => setRoomType(e.target.value)}>
                {ROOM_TYPES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Location</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField label="City" value={city} onChange={(e) => setCity(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Area" value={area} onChange={(e) => setArea(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Google Maps Location (optional)" value={mapsLocation} onChange={(e) => setMapsLocation(e.target.value)} fullWidth /></Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Rent</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField label="Monthly Rent" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Security Deposit" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel control={<Checkbox checked={maintenanceIncluded} onChange={(e) => setMaintenanceIncluded(e.target.checked)} />} label="Maintenance Included" />
          </Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Availability</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField label="Available From" type="date" InputLabelProps={{ shrink: true }} value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Lease Duration (months, optional)" value={leaseDuration} onChange={(e) => setLeaseDuration(e.target.value)} fullWidth /></Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Room Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><TextField label="Bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} fullWidth /></Grid>
          <Grid item xs={12} sm={3}><TextField label="Bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} fullWidth /></Grid>
          <Grid item xs={12} sm={3}><TextField label="Vacancy Available" type="number" value={vacancy} onChange={(e) => setVacancy(Number(e.target.value))} fullWidth /></Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="furnishing-label">Furnishing</InputLabel>
              <Select labelId="furnishing-label" value={furnishing} label="Furnishing" onChange={(e) => setFurnishing(e.target.value)}>
                <MenuItem value="Furnished">Furnished</MenuItem>
                <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
                <MenuItem value="Unfurnished">Unfurnished</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Amenities</Typography>
        <FormGroup row>
          {AMENITIES.map((a) => (
            <FormControlLabel key={a} control={<Checkbox checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />} label={a} />
          ))}
        </FormGroup>

        {listingType === 'tenant' && (
          <Box>
            <Typography sx={{ fontWeight: 700, mt: 2 }}>Current Flatmates (Tenant-only)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><TextField label="Current Occupants" type="number" value={currentOccupants} onChange={(e) => setCurrentOccupants(Number(e.target.value))} fullWidth /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Looking For (number)" type="number" value={lookingFor} onChange={(e) => setLookingFor(Number(e.target.value))} fullWidth /></Grid>
              <Grid item xs={12} sm={4}><TextField label="Why available" value={reasonAvailable} onChange={(e) => setReasonAvailable(e.target.value)} fullWidth /></Grid>
              <Grid item xs={12}><TextField label="About current flatmates" value={aboutFlatmates} onChange={(e) => setAboutFlatmates(e.target.value)} fullWidth multiline rows={3} /></Grid>
            </Grid>
          </Box>
        )}

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Preferred Flatmate</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField label="Occupation" value={preferredOccupation} onChange={(e) => setPreferredOccupation(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Gender" value={preferredGender} onChange={(e) => setPreferredGender(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Age Range" value={preferredAgeRange} onChange={(e) => setPreferredAgeRange(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Smoking" value={smokingPreference} onChange={(e) => setSmokingPreference(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Drinking" value={drinkingPreference} onChange={(e) => setDrinkingPreference(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={4}><TextField label="Pets Allowed" value={petsAllowed} onChange={(e) => setPetsAllowed(e.target.value)} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Food Preference" value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)} fullWidth /></Grid>
        </Grid>

        <Typography sx={{ fontWeight: 700, mt: 2 }}>Photos</Typography>
        <input type="file" accept="image/*" multiple onChange={handlePhotoChange} />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {photos.map((p, i) => (
            <Box key={i} sx={{ position: 'relative' }}>
              <img src={typeof p === 'string' ? p : URL.createObjectURL(p)} alt={`preview-${i}`} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Button size="small" onClick={() => setCoverIndex(i)} variant={coverIndex === i ? 'contained' : 'outlined'}>Cover</Button>
                <Button size="small" onClick={() => removePhoto(i)} variant="text" color="error">Remove</Button>
              </Box>
            </Box>
          ))}
        </Box>
        <Typography sx={{ color: '#6c5c53', fontSize: 13 }}>You can upload 1–10 photos. Select one as the cover image.</Typography>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" type="submit">Publish Listing</Button>
          <Button variant="outlined" onClick={() => navigate('/dashboard')}>Cancel</Button>
        </Box>
      </Box>
    </Box>
  )
}

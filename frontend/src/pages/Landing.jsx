import React, { useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'


export default function Landing() {
  const location = useLocation()

  useEffect(() => {
    // Support navbar clicks like /#about or /#contact
    if (!location?.hash) return
    const id = location.hash.replace('#', '')
    if (!id) return

    // Use a microtask so the element exists after route render.
    const t = setTimeout(() => {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)

    return () => clearTimeout(t)
  }, [location?.hash])

  return (
    <Box sx={{ minHeight: '100vh', background: '#f4ede6', px: 4, py: 6 }}>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '620px 460px',
          gap: '32px',
          maxWidth: '1120px',
          mx: 'auto',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: '64px', fontWeight: 800, lineHeight: 1.05, mb: '22px' }}>
            Find the right flat.
            <br />
            Find the right flatmate.
          </Typography>
          <Typography sx={{ fontSize: '18px', lineHeight: 1.75, color: '#5a4840', maxWidth: '520px', mb: '36px' }}>
            AI-powered rental matching that helps tenants discover the best rooms and helps owners find compatible tenants.
          </Typography>
          <Box sx={{ display: 'flex', gap: '20px' }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{ width: '280px', height: '60px', fontSize: '16px' }}
            >
              Looking for accommodation
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/register"
              sx={{
                width: '220px',
                height: '60px',
                fontSize: '16px',
                borderColor: '#5a4840',
                color: '#5a4840',
              }}
            >
              List a Property
            </Button>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', width: '460px', height: '620px' }}>
          <Box
            component="img"
            src="/hero_landing_page.png"
            alt="Hero rental landing"
            sx={{
              width: '460px',
              height: '620px',
              objectFit: 'cover',
              borderRadius: '28px',
              transformStyle: 'preserve-3d',
              boxShadow: [
                '10px 22px 60px rgba(0,0,0,0.10)',
                '-10px 18px 50px rgba(0,0,0,0.08)',
                '0 24px 90px rgba(0,0,0,0.18)',
              ].join(', '),

              transition: 'transform 220ms ease, box-shadow 220ms ease',
              filter: 'saturate(1.05) contrast(1.02)',
              '&:hover': {
                transform: 'translateY(-10px) rotateX(2deg) rotateY(-6deg)',
                boxShadow: '0 34px 120px rgba(0,0,0,0.22)',
              },
            }}
          />

        </Box>
      </Box>

      <Box id="how-it-works" sx={{ maxWidth: '1120px', mx: 'auto', mt: '64px', px: 2, scrollMarginTop: '96px' }}>
        <Typography sx={{ fontSize: '32px', fontWeight: 800, mb: '18px', textAlign: 'center' }}>
          How It Works
        </Typography>

        <Typography sx={{ color: '#5a4840', fontSize: '16px', textAlign: 'center', maxWidth: '720px', mx: 'auto', mb: '40px' }}>
          Getting started is easy. Follow five simple steps to create your profile, let our AI match you with the best flatmate, and move into your new home.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, minmax(0, 1fr))' },
            gap: '18px',
          }}
        >
          {[
            'Create an Account',
            'Complete Your Profile',
            'AI Finds the Best Match',
            'Connect & Chat',
            'Move In',
          ].map((label, index) => (
            <Box
              key={label}
              sx={{
                p: 3,
                borderRadius: '24px',
                background: '#ffffff',
                border: '1px solid rgba(90,72,64,0.12)',
                boxShadow: '0 12px 30px rgba(20, 20, 20, 0.04)',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: '52px',
                  height: '52px',
                  mx: 'auto',
                  mb: 2,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  background: '#fce9dd',
                  color: '#b35b1d',
                  fontWeight: 800,
                  fontSize: '18px',
                }}
              >
                {`0${index + 1}`}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '18px', mb: 1 }}>{label}</Typography>
              <Typography sx={{ color: '#6c5c53', fontSize: '14px', lineHeight: 1.7 }}>
                {index === 0 && 'Sign up quickly and start browsing listings.'}
                {index === 1 && 'Tell us your preferences so we can match you with the perfect space.'}
                {index === 2 && 'Our AI evaluates compatibility across listings and flatmates.'}
                {index === 3 && 'Message potential matches and schedule viewings with ease.'}
                {index === 4 && 'Choose your new home and move in with confidence.'}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* About (Landing section) */}
        <Box id="about" sx={{ mt: 8, scrollMarginTop: '96px', mb: 2 }}>
          <Typography sx={{ fontSize: '34px', fontWeight: 800, mb: '14px' }}>About</Typography>
          <Typography sx={{ color: '#5a4840', fontSize: '16px', lineHeight: 1.8, maxWidth: '820px', mb: 3 }}>
            Rent & Flatmate Finder connects tenants and owners with intelligent matching and chat support—so you can find a great home with confidence.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
            }}
          >
            {[{ title: 'Smart Matching', desc: 'AI-powered compatibility insights that help you connect with the right flatmate.' }, { title: 'Chat Support', desc: 'Communicate in real-time and share details faster—no endless waiting.' },].map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 3,
                  borderRadius: '22px',
                  background: '#ffffff',
                  border: '1px solid rgba(90,72,64,0.12)',
                  boxShadow: '0 12px 30px rgba(20, 20, 20, 0.04)',
                }}
              >
                <Box
                  sx={{
                    width: '44px',
                    height: '44px',
                    mb: 2,
                    borderRadius: '14px',
                    background: '#fce9dd',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#b35b1d',
                    fontWeight: 900,
                    fontSize: '18px',
                  }}
                >
                  ✓
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>{item.title}</Typography>
                <Typography sx={{ color: '#6c5c53', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact (Landing section) */}
        <Box id="contact" sx={{ mt: 8, pb: 10, scrollMarginTop: '96px' }}>
          <Typography sx={{ fontSize: '34px', fontWeight: 800, mb: '14px' }}>Contact</Typography>
          <Typography sx={{ color: '#5a4840', fontSize: '16px', lineHeight: 1.8, maxWidth: '820px', mb: 3 }}>
            Reach out to our team for support, partnership inquiries, or a quick product walkthrough.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr .8fr' },
              gap: 3,
              alignItems: 'stretch',
            }}
          >
            <Box
              sx={{
                p: 3.5,
                borderRadius: '22px',
                background: '#ffffff',
                border: '1px solid rgba(90,72,64,0.12)',
                boxShadow: '0 12px 30px rgba(20, 20, 20, 0.04)',
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 18, mb: 1 }}>Send a message</Typography>
              <Typography sx={{ color: '#6c5c53', fontSize: 14, lineHeight: 1.7, mb: 3 }}>
                Choose an option below—this is a lightweight demo UI.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  sx={{ background: '#5a4840', '&:hover': { background: '#4c3c34' } }}
                  href="mailto:support@rentbuddy.com"
                >
                  Email Support
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderColor: '#5a4840', color: '#5a4840' }}
                  onClick={() => {
                    window.location.href = 'mailto:demo@rentbuddy.com?subject=Request%20a%20demo';
                  }}
                >
                  Request a Demo
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                p: 3.5,
                borderRadius: '22px',
                background: '#f4ede6',
                border: '1px solid rgba(90,72,64,0.12)',
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1, color: '#5a4840' }}>
                Quick info
              </Typography>
              <Typography sx={{ color: '#6c5c53', fontSize: 14, lineHeight: 1.7, mb: 1 }}>
                <b>Support:</b> support@rentbuddy.com
              </Typography>
              <Typography sx={{ color: '#6c5c53', fontSize: 14, lineHeight: 1.7, mb: 1 }}>
                <b>Demo:</b> demo@rentbuddy.com
              </Typography>
              <Typography sx={{ color: '#6c5c53', fontSize: 14, lineHeight: 1.7 }}>
                We typically respond within 24–48 hours.
              </Typography>
            </Box>
          </Box>
        </Box>

      </Box>

    </Box>
  )
}

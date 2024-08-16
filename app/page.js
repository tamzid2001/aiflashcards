'use client'

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, CircularProgress, AppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/system';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const FlashCard = styled(Card)(({ theme }) => ({
  width: '300px',
  height: '200px',
  perspective: '1000px',
  cursor: 'pointer',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const CardFace = styled(CardContent)(({ theme, isBack }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  backgroundColor: isBack ? theme.palette.secondary.light : theme.palette.primary.light,
  color: theme.palette.getContrastText(isBack ? theme.palette.secondary.light : theme.palette.primary.light),
  transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
}));

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateFlashcards = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-0613",
          messages: [
            { role: "system", content: "You are a helpful assistant that creates flashcards." },
            { role: "user", content: `Create 10 flashcards about ${prompt}. Format each flashcard as a JSON object with 'question' and 'answer' fields.` }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      const generatedFlashcards = JSON.parse(data.choices[0].message.content);
      setFlashcards(generatedFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            AI Flashcards
          </Typography>
          <SignedOut>
            <SignInButton mode="modal">
              <Button color="inherit">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
      }}>
        <SignedOut>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            Welcome to AI Flashcards
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', maxWidth: 600, mb: 4 }}>
            Please sign in to start creating flashcards with AI.
          </Typography>
        </SignedOut>

        <SignedIn>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
            Create AI-Powered Flashcards
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Enter a topic for flashcards"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={generateFlashcards}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Generate Flashcards'}
            </Button>
          </Box>
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
          }}>
            {flashcards.map((card, index) => (
              <FlashCard key={index} sx={{ 
                '& .front, & .back': { 
                  position: 'absolute',
                  backfaceVisibility: 'hidden',
                  transition: 'transform 0.6s',
                },
                '& .back': { 
                  transform: 'rotateY(180deg)',
                },
                '&:hover .front': { 
                  transform: 'rotateY(180deg)',
                },
                '&:hover .back': { 
                  transform: 'rotateY(0deg)',
                },
              }}>
                <CardFace className="front">
                  <Typography variant="body1">{card.question}</Typography>
                </CardFace>
                <CardFace className="back" isBack>
                  <Typography variant="body1">{card.answer}</Typography>
                </CardFace>
              </FlashCard>
            ))}
          </Box>
        </SignedIn>
      </Box>
    </Box>
  );
}
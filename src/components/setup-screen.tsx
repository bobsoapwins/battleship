'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SetupScreenProps {
  onGameStart: (player1Name: string, player2Name: string) => void;
}

export const SetupScreen = ({ onGameStart }: SetupScreenProps) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleStart = () => {
    onGameStart(player1Name.trim() || 'Player 1', player2Name.trim() || 'Player 2');
  };

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Battleship</CardTitle>
            <CardDescription className="text-center">
                Welcome! Set your player names to begin.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
                <div className="space-y-2">
                    <Label htmlFor="player1-name">Player 1 Name</Label>
                    <Input
                    id="player1-name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    placeholder="Enter name for Player 1"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="player2-name">Player 2 Name</Label>
                    <Input
                    id="player2-name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    placeholder="Enter name for Player 2"
                    />
                </div>
                <Button onClick={handleStart} className="w-full mt-4">
                    Start Game
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

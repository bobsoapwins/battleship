'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GameMode } from '@/lib/game';

interface SetupScreenProps {
  onGameStart: (player1Name: string, player2Name: string, gameMode: GameMode) => void;
}

export const SetupScreen = ({ onGameStart }: SetupScreenProps) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('classic');

  const handleStart = () => {
    onGameStart(
      player1Name.trim() || 'Player 1', 
      player2Name.trim() || 'Player 2',
      gameMode
    );
  };

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Battleship</CardTitle>
            <CardDescription className="text-center">
                Welcome! Set your player names and game mode to begin.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-6">
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
                </div>

                <div className="space-y-4">
                    <Label>Game Mode</Label>
                    <RadioGroup defaultValue="classic" onValueChange={(value: GameMode) => setGameMode(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="classic" id="r1" />
                            <Label htmlFor="r1" className="font-normal">
                                <span className="font-medium">Classic</span>
                                <p className="text-xs text-muted-foreground">The original naval combat game. One shot per turn.</p>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="salvo" id="r2" />
                            <Label htmlFor="r2" className="font-normal">
                                <span className="font-medium">Salvo</span>
                                <p className="text-xs text-muted-foreground">Fire one shot for each of your remaining ships.</p>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <Button onClick={handleStart} className="w-full mt-2">
                    Start Game
                </Button>
            </div>
        </CardContent>
    </Card>
  );
};

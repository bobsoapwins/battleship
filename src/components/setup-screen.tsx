

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GameMode, AbilityConfig } from '@/lib/game';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AbilityDisclaimer } from './ability-disclaimer';

interface SetupScreenProps {
  onGameStart: (player1Name: string, player2Name: string, gameMode: GameMode, abilityConfig: AbilityConfig | null) => void;
}

const gameModeDetails: Record<GameMode, { title: string; description: string }> = {
    classic: {
        title: "Classic Mode",
        description: "The original naval combat experience. Players take turns firing one shot at a time to sink the opponent's fleet."
    },
    salvo: {
        title: "Salvo Mode",
        description: "Fire one shot for each of your ships that is still afloat. The number of shots decreases as your ships are sunk. More ships means more firepower!"
    },
    nuclear: {
        title: "Nuclear Mode",
        description: "One hit, one kill. Every successful hit instantly sinks the entire ship, regardless of its size. High stakes, fast-paced destruction."
    },
    ability: {
        title: "Ability Mode",
        description: "Engage in modern naval warfare with special abilities. Use Sonar to detect ships, launch a Tomahawk strike to hit multiple cells, or lay Mines to defend your fleet."
    }
};

export const SetupScreen = ({ onGameStart }: SetupScreenProps) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedModeInfo, setSelectedModeInfo] = useState(gameModeDetails.classic);
  const [showAbilityDisclaimer, setShowAbilityDisclaimer] = useState(false);

  const handleGameModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
    if (newMode === 'ability') {
        // The ability disclaimer is special and has its own component
        return; 
    }
    setSelectedModeInfo(gameModeDetails[newMode]);
    setInfoDialogOpen(true);
  };
  
  const handleStart = () => {
    if (gameMode === 'ability') {
      setShowAbilityDisclaimer(true);
    } else {
      onGameStart(
        player1Name.trim() || 'Player 1', 
        player2Name.trim() || 'Player 2',
        gameMode,
        null
      );
    }
  };

  const handleAbilityProceed = (abilityConfig: AbilityConfig) => {
    setShowAbilityDisclaimer(false);
    onGameStart(
      player1Name.trim() || 'Player 1',
      player2Name.trim() || 'Player 2',
      'ability',
      abilityConfig
    );
  };

  return (
    <>
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
                        <RadioGroup value={gameMode} onValueChange={handleGameModeChange}>
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
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nuclear" id="r3" />
                                <Label htmlFor="r3" className="font-normal">
                                    <span className="font-medium">Nuclear</span>
                                    <p className="text-xs text-muted-foreground">One hit, one kill. Each successful hit sinks the ship.</p>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ability" id="r4" />
                                <Label htmlFor="r4" className="font-normal">
                                    <span className="font-medium">Ability</span>
                                    <p className="text-xs text-muted-foreground">Use special abilities like Sonar Scan.</p>
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

        <AlertDialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-2xl">{selectedModeInfo.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {selectedModeInfo.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={() => setInfoDialogOpen(false)}>Got it!</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>

        <AbilityDisclaimer
          open={showAbilityDisclaimer}
          onProceed={handleAbilityProceed}
          onBack={() => setShowAbilityDisclaimer(false)}
        />
    </>
  );
};

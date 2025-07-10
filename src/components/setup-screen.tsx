

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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AbilityDisclaimer } from './ability-disclaimer';

type GameType = 'human' | 'ai';
interface SetupScreenProps {
  onGameStart: (player1Name: string, player2Name: string, gameMode: GameMode, abilityConfig: AbilityConfig | null, isAIGame: boolean) => void;
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
  const [gameType, setGameType] = useState<GameType>('human');
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
    const p2Name = gameType === 'ai' ? 'AI Commander' : player2Name.trim() || 'Player 2';
    if (gameMode === 'ability') {
      setShowAbilityDisclaimer(true);
    } else {
      onGameStart(
        player1Name.trim() || 'Player 1', 
        p2Name,
        gameMode,
        null,
        gameType === 'ai'
      );
    }
  };

  const handleAbilityProceed = (abilityConfig: AbilityConfig) => {
    setShowAbilityDisclaimer(false);
    const p2Name = gameType === 'ai' ? 'AI Commander' : player2Name.trim() || 'Player 2';
    onGameStart(
      player1Name.trim() || 'Player 1',
      p2Name,
      'ability',
      abilityConfig,
      gameType === 'ai'
    );
  };

  return (
    <>
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Game Setup</CardTitle>
                <CardDescription className="text-center">
                    Configure your game and prepare for battle.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-headline">Step 1: Game Type</AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2">
                        <RadioGroup value={gameType} onValueChange={(v) => setGameType(v as GameType)} className="gap-4">
                           <Label className="flex items-center space-x-3 p-4 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                <RadioGroupItem value="human" id="g1" />
                                <div>
                                  <p className="font-medium">Player vs. Player</p>
                                  <p className="text-sm text-muted-foreground">Two human players battle it out.</p>
                                </div>
                            </Label>
                            <Label className="flex items-center space-x-3 p-4 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                <RadioGroupItem value="ai" id="g2" />
                                <div>
                                  <p className="font-medium">Player vs. AI</p>
                                  <p className="text-sm text-muted-foreground">Test your skills against an AI Commander.</p>
                                </div>
                            </Label>
                        </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-headline">Step 2: Player Names</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 pt-2">
                          <div className="space-y-2">
                              <Label htmlFor="player1-name">Player 1 Name</Label>
                              <Input
                              id="player1-name"
                              value={player1Name}
                              onChange={(e) => setPlayer1Name(e.target.value)}
                              placeholder="Enter your name"
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="player2-name">{gameType === 'ai' ? 'AI Name' : 'Player 2 Name'}</Label>
                              <Input
                              id="player2-name"
                              value={gameType === 'ai' ? 'AI Commander' : player2Name}
                              onChange={(e) => setPlayer2Name(e.target.value)}
                              placeholder="Enter name for Player 2"
                              disabled={gameType === 'ai'}
                              />
                          </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-headline">Step 3: Game Mode</AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2">
                          <RadioGroup value={gameMode} onValueChange={handleGameModeChange} className="gap-2">
                              <Label className="flex items-center space-x-3 p-3 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                  <RadioGroupItem value="classic" id="r1" />
                                  <div>
                                      <span className="font-medium">Classic</span>
                                      <p className="text-xs text-muted-foreground">The original naval combat game. One shot per turn.</p>
                                  </div>
                              </Label>
                              <Label className="flex items-center space-x-3 p-3 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                  <RadioGroupItem value="salvo" id="r2" />
                                  <div>
                                      <span className="font-medium">Salvo</span>
                                      <p className="text-xs text-muted-foreground">Fire one shot for each of your remaining ships.</p>
                                  </div>
                              </Label>
                              <Label className="flex items-center space-x-3 p-3 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                  <RadioGroupItem value="nuclear" id="r3" />
                                  <div>
                                      <span className="font-medium">Nuclear</span>
                                      <p className="text-xs text-muted-foreground">One hit, one kill. Each successful hit sinks the ship.</p>
                                  </div>
                              </Label>
                              <Label className="flex items-center space-x-3 p-3 border rounded-md has-[input:checked]:bg-secondary cursor-pointer">
                                  <RadioGroupItem value="ability" id="r4" />
                                  <div>
                                      <span className="font-medium">Ability</span>
                                      <p className="text-xs text-muted-foreground">Use special abilities to destroy your opponent</p>
                                  </div>
                              </Label>
                          </RadioGroup>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Button onClick={handleStart} className="w-full mt-6" size="lg">
                    Start Game
                </Button>
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
                <AlertDialogAction onClick={() => setInfoDialogOpen(false)}>Acknowledge</AlertDialogAction>
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

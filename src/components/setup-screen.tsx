

'use client';

import { useState, useEffect } from 'react';
import type { EmblaCarouselType } from 'embla-carousel-react'
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GameMode, AbilityConfig } from '@/lib/game';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AbilityDisclaimer } from './ability-disclaimer';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Pencil } from 'lucide-react';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [highestStepReached, setHighestStepReached] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    draggable: false,
    loop: false,
    align: 'start',
  });

  const steps = ["Game Type", "Player Names", "Game Mode"];

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (api: EmblaCarouselType) => {
      const selectedSnap = api.selectedScrollSnap();
      setCurrentStep(selectedSnap);
      setHighestStepReached(prev => Math.max(prev, selectedSnap));
    };
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect) };
  }, [emblaApi]);

  const handleGameModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
  };
  
  const handleStart = () => {
    setHighestStepReached(steps.length); // Mark all steps as reached
    if (gameMode === 'ability') {
      setShowAbilityDisclaimer(true);
    } else {
        setSelectedModeInfo(gameModeDetails[gameMode]);
        setInfoDialogOpen(true);
    }
  };

  const proceedFromInfoDialog = () => {
    setInfoDialogOpen(false);
    const p2Name = gameType === 'ai' ? 'AI Commander' : player2Name.trim() || 'Player 2';
    onGameStart(
        player1Name.trim() || 'Player 1',
        p2Name,
        gameMode,
        null,
        gameType === 'ai'
    );
  }

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

  const handleNext = () => {
    emblaApi?.scrollNext();
  };

  const handleBack = () => {
    emblaApi?.scrollPrev();
  }
  
  const StepIndicator = ({ step, label }: { step: number; label: string }) => {
    const isActive = step === currentStep;
    const isCompleted = step < highestStepReached;

    return (
        <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", isActive ? "border-primary" : "border-muted", isCompleted ? "border-green-500" : "")}>{!isActive && !isCompleted && <div className="w-2 h-2 rounded-full bg-muted" />} {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}</div>}
            <span className={cn("font-medium", isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground")}>{label}</span>
        </div>
    )
  }

  return (
    <>
        <Card className="w-full max-w-2xl overflow-hidden">
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Game Setup</CardTitle>
                <CardDescription className="text-center">
                    Configure your game and prepare for battle.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-1 md:px-6">
                <div className="flex justify-center space-x-4 md:space-x-8 mb-6">
                    {steps.map((label, index) => (
                        <StepIndicator key={index} step={index} label={label} />
                    ))}
                </div>

                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex">
                        {/* Step 1: Game Type */}
                        <div className="min-w-0 flex-[0_0_100%] p-1 animate-carousel-in">
                           <div className="pt-2">
                            <RadioGroup value={gameType} onValueChange={(v) => setGameType(v as GameType)} className="grid md:grid-cols-2 gap-4">
                               <Label className="flex items-center space-x-3 p-4 border rounded-md has-[input:checked]:bg-secondary cursor-pointer transition-colors">
                                    <RadioGroupItem value="human" id="g1" />
                                    <div>
                                      <p className="font-medium">Player vs. Player</p>
                                      <p className="text-sm text-muted-foreground">Two human players battle it out.</p>
                                    </div>
                                </Label>
                                <Label className="flex items-center space-x-3 p-4 border rounded-md has-[input:checked]:bg-secondary cursor-pointer transition-colors">
                                    <RadioGroupItem value="ai" id="g2" />
                                    <div>
                                      <p className="font-medium">Player vs. AI</p>
                                      <p className="text-sm text-muted-foreground">Test your skills against an AI Commander.</p>
                                    </div>
                                </Label>
                            </RadioGroup>
                           </div>
                        </div>

                        {/* Step 2: Player Names */}
                        <div className="min-w-0 flex-[0_0_100%] p-1 animate-carousel-in">
                            <div className="grid gap-4 pt-2">
                              <div className="space-y-2">
                                  <Label htmlFor="player1-name">Player 1 Name</Label>
                                  <Input
                                  id="player1-name"
                                  value={player1Name}
                                  onChange={(e) => setPlayer1Name(e.target.value)}
                                  placeholder="Enter player name"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="player2-name">{gameType === 'ai' ? 'AI Name' : 'Player 2 Name'}</Label>
                                  <Input
                                  id="player2-name"
                                  value={gameType === 'ai' ? 'AI Commander' : player2Name}
                                  onChange={(e) => setPlayer2Name(e.target.value)}
                                  placeholder="Enter player name"
                                  disabled={gameType === 'ai'}
                                  />
                              </div>
                            </div>
                        </div>

                        {/* Step 3: Game Mode */}
                        <div className="min-w-0 flex-[0_0_100%] p-1 animate-carousel-in">
                            <div className="pt-2">
                                <RadioGroup value={gameMode} onValueChange={handleGameModeChange} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {Object.entries(gameModeDetails).map(([key, { title, description }]) => (
                                        <Label key={key} className="flex items-start space-x-3 p-3 border rounded-md has-[input:checked]:bg-secondary cursor-pointer transition-colors h-full">
                                            <RadioGroupItem value={key} id={key} className="mt-1" />
                                            <div>
                                                <span className="font-medium">{title}</span>
                                                <p className="text-xs text-muted-foreground leading-tight">{description}</p>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full flex justify-between mt-6">
                    <Button onClick={handleBack} variant="outline" disabled={currentStep === 0}>
                        Back
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleStart}>
                            {gameMode === 'ability' ? 'Configure Abilities' : 'Start Game'}
                        </Button>
                    )}
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
                <AlertDialogFooter>
                    <AlertDialogCancel>Change Gamemode</AlertDialogCancel>
                    <AlertDialogAction onClick={proceedFromInfoDialog}>Proceed to Battle</AlertDialogAction>
                </AlertDialogFooter>
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

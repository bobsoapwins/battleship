
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanSearch, Rocket, Bomb } from 'lucide-react';
import type { Player, ActiveAbility } from '@/lib/game';
import { cn } from '@/lib/utils';

interface AbilitiesProps {
    player: Player;
    onToggleAbility: (ability: ActiveAbility) => void;
    activeAbility: ActiveAbility;
    isPlacement?: boolean;
}

export const Abilities = ({ player, onToggleAbility, activeAbility, isPlacement = false }: AbilitiesProps) => {
    const { abilities } = player;

    if (isPlacement) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Place Mines</CardTitle>
                    <CardDescription>Place defensive mines on your grid.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        onClick={() => onToggleAbility('mine')} 
                        variant={activeAbility === 'mine' ? 'default' : 'outline'}
                        disabled={abilities.mine.uses <= 0}
                    >
                        <Bomb className="mr-2" />
                        Place Mine ({abilities.mine.uses} left)
                    </Button>
                </CardContent>
            </Card>
        )
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Special Abilities</CardTitle>
                <CardDescription>Use your abilities strategically to gain an advantage.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                        onClick={() => onToggleAbility('sonar')} 
                        variant={activeAbility === 'sonar' ? 'default' : 'outline'}
                        disabled={abilities.sonar.uses <= 0}
                    >
                        <ScanSearch className="mr-2" />
                        Sonar ({abilities.sonar.uses})
                    </Button>
                    <Button 
                        onClick={() => onToggleAbility('tomahawk')}
                        variant={activeAbility === 'tomahawk' ? 'default' : 'outline'}
                        disabled={abilities.tomahawk.uses <= 0}
                    >
                        <Rocket className="mr-2" />
                        Tomahawk ({abilities.tomahawk.uses})
                    </Button>
                     <Button 
                        onClick={() => onToggleAbility('mine')} 
                        variant="outline"
                        disabled={true}
                    >
                        <Bomb className="mr-2" />
                        Mines Placed
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}


'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanSearch } from 'lucide-react';

interface AbilitiesProps {
    onActivateSonar: () => void;
}

export const Abilities = ({ onActivateSonar }: AbilitiesProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Special Abilities</CardTitle>
                <CardDescription>Use your abilities strategically to gain an advantage.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={onActivateSonar} variant="outline">
                        <ScanSearch className="mr-2" />
                        Sonar Scan
                    </Button>
                    <Button variant="outline" disabled>
                        Tomahawk (Soon)
                    </Button>
                    <Button variant="outline" disabled>
                        Mine (Soon)
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

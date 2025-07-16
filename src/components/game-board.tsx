
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { Target, Waves, Ship as ShipIcon, Skull, Bomb } from 'lucide-react';
import type { Board, Ship, Point, ShipType, Orientation } from '@/lib/game';
import { GRID_SIZE, canPlaceShip } from '@/lib/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  boardData: Board;
  ships: Ship[];
  onCellClick: (x: number, y: number) => void;
  isPlayerBoard: boolean;
  disabled?: boolean;
  lastShot?: Point | null;
  lastMultiShot?: Point[] | null;
  revealShips?: boolean;
  scannedArea?: Point[] | null;
  isUsingAbility?: boolean;
  isPlacingMine?: boolean;
  placementPreview?: {
    shipToPlace: ShipType;
    orientation: Orientation;
  } | null;
}

export const GameBoard: FC<GameBoardProps> = ({ 
  boardData, 
  ships, 
  onCellClick, 
  isPlayerBoard, 
  disabled = false, 
  lastShot, 
  lastMultiShot,
  revealShips = false, 
  scannedArea = null,
  isUsingAbility = false,
  isPlacingMine = false,
  placementPreview = null
}) => {
  const [hoverPosition, setHoverPosition] = useState<Point | null>(null);

  const getShipAt = (x: number, y: number) => {
    return ships.find(ship => ship.positions.some(pos => pos.x === x && pos.y === y));
  };
  
  const isSunk = (ship: Ship | undefined) => ship?.sunk;

  const isScanned = (x: number, y: number) => {
    if (!scannedArea) return false;
    return scannedArea.some(pos => pos.x === x && pos.y === y);
  };
  
  const getPreviewCells = (): { points: Point[], isValid: boolean } | null => {
    if (!placementPreview || !hoverPosition || disabled || isPlacingMine) return null;

    const { shipToPlace, orientation } = placementPreview;
    if (!shipToPlace) return null;

    const { x, y } = hoverPosition;
    const isValid = canPlaceShip(boardData, shipToPlace.size, x, y, orientation);
    const points: Point[] = [];
    
    for (let i = 0; i < shipToPlace.size; i++) {
        if (orientation === 'horizontal') {
            if (x + i < GRID_SIZE) points.push({ x: x + i, y });
        } else {
            if (y + i < GRID_SIZE) points.push({ x, y: y + i });
        }
    }
    return { points, isValid };
  };

  const previewInfo = getPreviewCells();

  const isPreviewCell = (x: number, y: number) => {
    if (!previewInfo) return false;
    return previewInfo.points.some(p => p.x === x && p.y === y);
  };


  const renderCellContent = (x: number, y: number) => {
    const cell = boardData[y][x];
    const ship = getShipAt(x, y);

    switch (cell) {
      case 'hit':
        return isSunk(ship) 
          ? <Skull className="w-5 h-5 text-red-700" />
          : <Target className="w-5 h-5 text-red-500" />;
      case 'miss':
        return <Waves className="w-5 h-5 text-white/70" />;
      case 'ship':
        if (isPlayerBoard || revealShips || isScanned(x, y)) {
          return <ShipIcon className="w-5 h-5 text-primary-foreground/80" />;
        }
        return null;
      case 'mine':
        if (isPlayerBoard || revealShips) {
            return <Bomb className="w-5 h-5 text-yellow-400" />
        }
        return null;
      default:
        return null;
    }
  };

  const isLastShot = (x: number, y: number) => {
    if (lastShot) {
      return lastShot.x === x && lastShot.y === y;
    }
    if (lastMultiShot) {
      return lastMultiShot.some(p => p.x === x && p.y === y);
    }
    return false;
  }

  return (
    <div 
      className="grid grid-cols-10 grid-rows-10 gap-1 bg-primary/20 p-2 rounded-lg shadow-inner aspect-square w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg"
      onMouseLeave={() => setHoverPosition(null)}
    >
      {boardData.map((row, y) =>
        row.map((cell, x) => {
          const ship = getShipAt(x, y);
          const isShipSunk = isSunk(ship);
          const wasLastShot = isLastShot(x, y);
          const showShip = isPlayerBoard || (revealShips && (cell === 'ship' || cell === 'hit'));
          const cellIsScanned = !isPlayerBoard && isScanned(x, y);
          const isPreview = isPreviewCell(x, y);
          
          return (
            <div
              key={`${x}-${y}`}
              onClick={() => !disabled && onCellClick(x, y)}
              onMouseEnter={() => setHoverPosition({x, y})}
              className={cn(
                'w-full h-full rounded-sm flex items-center justify-center aspect-square transition-colors duration-200 relative',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                !disabled && !isUsingAbility && !isPlacingMine && !placementPreview && 'hover:bg-accent/50',
                isUsingAbility && !disabled && 'cursor-crosshair hover:bg-red-500/50',
                isPlacingMine && !disabled && 'cursor-crosshair hover:bg-yellow-500/50',
                showShip ? 'bg-primary/80' : 'bg-primary/40',
                cell === 'hit' && 'bg-red-500/80',
                isShipSunk && 'bg-red-800/80',
                cell === 'miss' && 'bg-blue-300/50',
                cellIsScanned && !revealShips && 'bg-accent/70',
                wasLastShot && 'animate-shot z-10',
                isPreview && previewInfo?.isValid && 'bg-green-500/50',
                isPreview && !previewInfo?.isValid && 'bg-red-500/50',
              )}
            >
              {renderCellContent(x, y)}
            </div>
          );
        })
      )}
    </div>
  );
};

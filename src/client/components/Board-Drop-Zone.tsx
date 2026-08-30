import { useDroppable } from '@dnd-kit/core'
import React, { useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { BoardBounds, localPosToPixel } from '@/model/geometry';
import { PlacedCardInstance, resolveUICard } from '@/model/card';
import Card from './Card';

const isOverCol1: string = '#d0f0d0'
const isOverCol2: string = '#f0f0f0'

export default function BoardDropZone({ id, bounds, placedCards }: {
  id: string;
  bounds: BoardBounds;
  placedCards: PlacedCardInstance[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Work to find the dimensions of the box
  // 'dimensions' are used in anyh instance where DnD doesn't provide the board rect info
  const refContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });


  // when component first renders or when val in dependency array changes between renders
  useEffect(() => {
    const rectDOMNode = refContainer.current;
    if (!rectDOMNode) return;

    // ResizeObserver is browser API, watches DOM element and fires callback whenever size changed
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width, height })
    })
    observer.observe(rectDOMNode)
    return () => observer.disconnect(); // useEffect calls this callback before unmounting
  }, [])


  return (
    <div
      ref={mergeRefs([setNodeRef as React.Ref<HTMLDivElement>, refContainer])} // cast correctly
      className="board-drop-zone"
      style={{ position: 'relative', background: isOver ? isOverCol1 : isOverCol2 }}
    >
      Drop Cards Here. width: {dimensions.width} |  height: {dimensions.height}
      {placedCards.map(card => {
        const uiCard = resolveUICard(card) // Get name, img etc
        if (!uiCard) return null;

        const { left, top } = localPosToPixel(card.position, bounds, dimensions);
        return (
          <div key={card.instanceID} style={{ position: 'absolute', left, top }} /* absolute goes to nearest positioned, ie board*/>
            <Card id={card.instanceID} name={uiCard.name} image={uiCard.image} />
          </div>
        );
      })}
    </div >
  )
}

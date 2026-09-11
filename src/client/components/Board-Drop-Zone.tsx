import { useDraggable, useDroppable } from '@dnd-kit/core'
import React, { useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { BoardBounds, localPosToPixel } from '@/model/geometry';
import { PlacedCardInstance, UICard } from '@/model/card';
import Card from './Card';
import { CSS } from '@dnd-kit/utilities';

export default function BoardDropZone({ id, bounds, placedCards, activeCardData }: {
  id: string;
  bounds: BoardBounds;
  placedCards: PlacedCardInstance[],
  activeCardData: UICard | null
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
      className={isOver ? 'board-drop-zone is-over' : 'board-drop-zone'}
    >
      Drop Cards Here. width: {dimensions.width} |  height: {dimensions.height}

      {placedCards.map(card => {
        if (!card) return null;

        const { left, top } = localPosToPixel(card.position, bounds, dimensions);
        return (
          <div key={card.instanceID} style={{ position: 'absolute', left, top }} /* absolute goes to nearest positioned, ie board*/>
            <DraggableBoardCard id={card.instanceID} name={card.name} image={card.image} activeCardData={activeCardData} />
          </div>
        );
      })}
    </div >
  )
}


function DraggableBoardCard({ id, name, image, activeCardData }: {
  id: string; name: string; image: string; activeCardData: UICard | null
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id })
  let hidden = false;
  if (activeCardData && id === activeCardData.instanceID) { hidden = true }

  const style = {
    // transform: CSS.Translate.toString(transform),
    // opacity: opacity
    opacity: hidden ? 0 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div style={style}>
        <Card name={name} image={image} />
      </div>
    </div>
  )
}

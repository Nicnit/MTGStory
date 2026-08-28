import { useDroppable } from '@dnd-kit/core'
import React, { useEffect, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';

export default function BoardDropZone({ id }: { id: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Work to find the dimensions of the box
  const refContainer = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  // On effect update ref model of size
  useEffect(() => {
    if (refContainer.current) {
      setDimensions(({
        width: refContainer.current.offsetWidth,
        height: refContainer.current.offsetHeight,
      }))
    }
  }, [])


  return (
    <div
      ref={mergeRefs([setNodeRef as React.Ref<HTMLDivElement>, refContainer])} // cast correctly
      className="board-drop-zone"
      style={{ background: isOver ? '#d0f0d0' : '#f0f0f0' }}
    >
      Drop Cards Here. width: {dimensions.width} |  height: {dimensions.height}
    </div>
  )
}

import { useDroppable } from '@dnd-kit/core'


export default function BoardDropZone({ id }: { id: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="board-drop-zone"
      style={{ background: isOver ? '#d0f0d0' : '#f0f0f0' }}
    >
      Drop Cards Here
    </div>
  )
}

import { DndContext, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

interface CardProps {
  id: string;
  name: string;
  image: string;
  onClick?: () => void;
}

function Card({ id, name, image, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),   // handle smooth movement math
  }


  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="card" onClick={onClick}>
      <img src={image} alt={name} className="card-image" />
    </div>
  );
}

export default Card;

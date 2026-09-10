
function Card({ name, image }: { name: string, image: string }) {
  return (
    <div>
      <img src={image} alt={name} className="card" />
    </div>
  )
}


export default Card;

//
// interface CardProps {
//   id: string;
//   name: string;
//   image: string;
//   onClick?: () => void;
// }
//
//
//
//
// Card as mroe than just an image. id here is for DOM node, for dnd-kit features
// replaced by SortableHandCard in Hand.

// function Card({ id, name, image, onClick }: CardProps) {
//   // Also iuncludes useDraggable
//   const { isDragging, attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: id,
//   })
//
//   const style = {
//     transform: CSS.Translate.toString(transform),   // Move the card to its dragged to position
//     transition, // smooths the animation when reordering
//     opacity: isDragging ? 0 : 1, // If is dragging, hide while clone exists in DragOverlay
//   }
//
//
//   return (
//     <div ref=
//       {setNodeRef}
//       style={style}
//       {...listeners}
//       {...attributes}
//       className="card"
//       onClick={onClick}>
//       <img src={image} alt={name} className="card-image" />
//     </div>
//   );
// }
//

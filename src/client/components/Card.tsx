interface CardProps {
  name: string;
  image: string;
  onClick?: () => void;
}

function Card({ name, image, onClick }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <img src={image} alt={name} className="card-image" />
    </div>
  );
}

export default Card;

function Card({ title, description, actions }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
        {actions && <div className="mt-2 space-x-2">{actions}</div>}
      </div>
    );
  }
  
  export default Card;
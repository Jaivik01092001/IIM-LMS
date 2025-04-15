function Card({ title, description, actions, image }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-100">
      {image && (
        <div className="h-48 w-full overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {actions && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
interface CategoryCardProps {
  title: string;
  image: string;
  description: string;
}

const CategoryCard = ({ title, image, description }: CategoryCardProps) => {
  return (
    <div 
      className="group cursor-pointer rounded-2xl overflow-hidden bg-card border border-border transition-all duration-300 hover:scale-105 shadow-md"
    >
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
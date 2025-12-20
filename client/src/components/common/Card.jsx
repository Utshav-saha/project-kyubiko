export default function Card({ name, image, description }) {
  return (
    
    <div className="card group w-72 h-112.5 shadow-sm relative overflow-hidden rounded-xl flex flex-col">
      
      <figure className="flex-1 overflow-hidden w-full relative bg-transparent">
        <img
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={image}
          alt={name}
        />
      </figure>
      
      
      <div className="card-body bg-brown w-full grow-0 p-4 min-h-15 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0">
        <h2 className="card-title text-white font-dmsans text-lg text-center">
          {name}
        </h2>
      </div>

      <div className="absolute bottom-0 left-0 z-10 flex h-0 w-full flex-col items-center justify-center overflow-hidden bg-[linear-gradient(transparent,#1c1c1c_58%)] px-6 text-center transition-[height] duration-500 ease-in-out group-hover:h-full">
        
        <h3 className="font-dmsans mb-3 text-2xl font-bold text-white translate-y-10 opacity-0 transition-all duration-500 delay-100 group-hover:translate-y-0 group-hover:opacity-100">
          {name}
        </h3>
        
        <p className="text-white text-sm translate-y-10 opacity-0 transition-all duration-500 delay-200 group-hover:translate-y-0 group-hover:opacity-100">
          {description}
        </p>

        <button className="btn btn-primary mt-4 bg-accent-yellow text-black border-transparent">Read More</button>

      </div>

    </div>
  );
}
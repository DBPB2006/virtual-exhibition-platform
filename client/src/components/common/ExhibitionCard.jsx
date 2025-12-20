import { Link } from "react-router-dom";
import { Calendar, Eye } from "lucide-react";

// Renders a visual card for an exhibition, adapting styles based on the exhibition theme (art, fashion, modern)
export function ExhibitionCard({ exhibition, index, variant = 'default' }) {

  const isFashion = variant === 'fashion';
  const isArt = variant === 'art';
  const isDarkModern = variant === 'dark-modern';

  // Determine CSS classes for different card variants
  const cardClasses = `group relative overflow-hidden transition-all duration-700 bg-[#080808] h-[450px] w-full cursor-pointer
        ${isArt ? "rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 bg-white" : ""}
        ${isFashion ? "rounded-none border-b-4 border-transparent hover:border-black hover:shadow-none bg-white" : ""}
        ${isDarkModern ? "h-full border border-neutral-800 hover:border-white" : ""}
        ${!isArt && !isFashion && !isDarkModern ? "rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 bg-white" : ""} 
    `;

  return (
    <Link to={`/exhibitions/${exhibition.id}`} className={cardClasses}>
      <div className={`absolute inset-0 w-full h-full overflow-hidden ${isArt ? "rounded-2xl" : ""}`}>
        {exhibition.coverImage ? (
          <motion.img
            src={exhibition.coverImage}
            alt={exhibition.title}
            className={`object-cover w-full h-full transition-transform duration-1000 ease-out
                          ${isArt ? "group-hover:scale-105" : ""}
                          ${isFashion || isDarkModern ? "grayscale group-hover:grayscale-0 group-hover:scale-105" : ""}
                          ${!isArt && !isFashion && !isDarkModern ? "group-hover:scale-110" : ""}
                      `}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center
              ${isDarkModern ? "bg-neutral-900" : "bg-gray-100"}
          `}>
            <span className={`text-[10px] uppercase tracking-widest font-mono
                  ${isDarkModern ? "text-neutral-700" : "text-gray-400"}
             `}>
              Preview Unavailable
            </span>
          </div>
        )}


        {isArt && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
        )}

        {isFashion && (
          <div className="absolute inset-0 bg-violet-900/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}

        {isDarkModern && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-all duration-700" />
        )}

        {!isArt && !isFashion && !isDarkModern && (
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
        )}
      </div>

      <div className={`absolute bottom-0 left-0 w-full p-6 lg:p-8 flex flex-col justify-end h-full z-10 
                ${isFashion ? "mix-blend-difference text-white" : "text-white"}
                ${isDarkModern ? "justify-between p-6" : ""}
                `}
      >
        {isDarkModern && (
          <div className="self-start px-2 py-1 border border-white/10 bg-black/30 backdrop-blur-md text-white/70 text-[10px] uppercase font-mono tracking-widest mb-auto">
            {exhibition.theme || "Exhibition"}
          </div>
        )}

        {!isDarkModern && (
          <div className="flex gap-2 mb-4">
            <div className={`inline-flex self-start px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] backdrop-blur-md
                  ${isArt ? "bg-white/20 rounded-full border border-white/30" : "bg-black text-white"}`}>
              {(!exhibition.isForSale || exhibition.price === 0) ? "Free Entry" : "Paid Access"}
            </div>
          </div>
        )}

        {isDarkModern ? (
          <div className="border-t border-white/20 pt-6 w-full">
            <h3 className="font-sans font-medium text-3xl md:text-5xl uppercase leading-[0.85] text-white group-hover:text-neutral-300 transition-colors duration-300 mb-4">
              {exhibition.title}
            </h3>
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">{exhibition.exhibitor}</p>
                {exhibition.isForSale && (
                  <p className="font-mono text-xs text-white font-bold uppercase tracking-widest">
                    {exhibition.price > 0 ? `₹${exhibition.price.toLocaleString()}` : "Inquire"}
                  </p>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">{exhibition.startDate}</p>
            </div>
          </div>
        ) : (
          <>
            <h3 className={`font-serif text-3xl md:text-3xl lg:text-4xl leading-none mb-2 transition-transform duration-500 origin-left
                    ${isArt ? "group-hover:translate-x-2 italic" : "font-sans font-black uppercase tracking-tighter"}
                `}>
              {exhibition.title}
            </h3>

            <p className="text-sm font-medium tracking-wide opacity-80 uppercase">
              {exhibition.exhibitor}
            </p>
          </>
        )}

        {isFashion && (
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
            <span className="bg-white text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
              View
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

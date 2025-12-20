import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Displays a clickable card for a specific category, showing a preview of exhibitions and facilitating navigation
const CategoryCard = ({ category, description, exhibitions = [], count = 0 }) => {
    const navigate = useNavigate();

    // Generates a URL-friendly slug from the category name
    const slug = category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-');

    const handleClick = () => {
        navigate(`/exhibitions/${slug}`);
    };

    return (
        <div
            onClick={handleClick}
            className="group relative flex flex-col justify-between h-[480px] p-10 bg-white transition-all duration-500 ease-out cursor-pointer overflow-hidden border-t border-gray-100 hover:border-black"
        >
            <div className="absolute inset-0 bg-neutral-900 translate-y-full transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:translate-y-0 z-0" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b border-gray-100 pb-6 group-hover:border-white/20 transition-colors duration-500">
                        <span className="text-sm font-medium tracking-widest uppercase text-neutral-400 group-hover:text-neutral-400">
                            0{count} Collection{count !== 1 && 's'}
                        </span>
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-lg text-black group-hover:text-white -rotate-45 group-hover:rotate-0 transition-all duration-500"
                        />
                    </div>

                    <div>
                        <h3 className="text-4xl md:text-5xl font-light tracking-tight text-black group-hover:text-white transition-colors duration-500 mb-4">
                            {category}
                        </h3>
                        <p className="text-base leading-relaxed text-gray-500 group-hover:text-gray-400 transition-colors duration-500 max-w-sm font-light">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex items-end gap-1 mt-auto translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    {exhibitions.slice(0, 3).map((exh, idx) => (
                        <div
                            key={exh._id || idx}
                            className="relative w-1/3 aspect-[3/4] bg-neutral-800 overflow-hidden"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                            {exh.coverImage ? (
                                <img
                                    src={exh.coverImage.startsWith('http') ? exh.coverImage : `http://localhost:5050${exh.coverImage}`}
                                    alt={exh.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-center">
                                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{exh.title}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;

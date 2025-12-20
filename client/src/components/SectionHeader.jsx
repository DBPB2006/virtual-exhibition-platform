import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

// Displays a consistent section header including a title and an optional navigation link
const SectionHeader = ({ title, linkText, onLinkClick }) => {
    return (
        <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-light text-black tracking-wide">{title}</h2>
            {linkText && (
                <button
                    onClick={onLinkClick}
                    className="group flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
                >
                    {linkText}
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs transition-transform group-hover:translate-x-1" />
                </button>
            )}
        </div>
    );
};

export default SectionHeader;

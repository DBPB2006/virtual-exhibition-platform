import { motion } from 'framer-motion';

// Wraps content with an animated full-screen transition effect on route changes
const PageTransition = ({ children }) => {
    return (
        <>
            {children}
            <motion.div
                className="fixed inset-0 z-50 bg-black pointer-events-none"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 0 }}
                exit={{ scaleY: 1 }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 0 }}
            />
            <motion.div
                className="fixed inset-0 z-50 bg-black pointer-events-none"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ originY: 1 }}
            />
        </>
    );
};

export default PageTransition;

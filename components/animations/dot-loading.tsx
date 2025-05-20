"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DotLoadingProps {
    /**
     * Color of the dots (default is pink)
     */
    readonly dotColor?: string;

    /**
     * Background color of the container (default is light gray)
     */
    readonly backgroundColor?: string;

    /**
     * Additional CSS class
     */
    readonly className?: string;

    /**
     * Automatically scroll down when displayed
     * @default true
     */
    readonly autoScroll?: boolean;
}

export function DotLoading({
    dotColor = "#ec4899", // Default pink color (pink-500)
    backgroundColor = "#e5e7eb", // Default light gray color (gray-200)
    className,
    autoScroll = true,
}: DotLoadingProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Automatically scroll down when the component is rendered
        if (autoScroll && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [autoScroll]);

    const dotVariants = {
        initial: {
            scale: 1,
            opacity: 0.7,
        },
        animate: {
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
            }
        }
    };

    // Delay for each dot to create a wave effect
    const dotDelays = [0, 0.2, 0.4];

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex items-center justify-center rounded-full py-2 px-4",
                className
            )}
            style={{ backgroundColor }}
        >
            {[0, 1, 2].map((index) => (
                <motion.div
                    key={index}
                    className="w-3 h-3 mx-1 rounded-full"
                    style={{ backgroundColor: dotColor }}
                    variants={dotVariants}
                    initial="initial"
                    animate="animate"
                    transition={{
                        ...dotVariants.animate.transition,
                        delay: dotDelays[index],
                    }}
                />
            ))}
        </div>
    );
}

export default DotLoading;
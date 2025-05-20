"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DotLoadingProps {
  /**
   * Màu của các chấm (mặc định là hồng)
   */
  dotColor?: string;
  
  /**
   * Màu nền của container (mặc định là xám nhạt)
   */
  backgroundColor?: string;
  
  /**
   * Class CSS bổ sung
   */
  className?: string;
  
  /**
   * Tự động scroll xuống khi hiển thị
   * @default true
   */
  autoScroll?: boolean;
}

export function DotLoading({
  dotColor = "#ec4899", // Màu hồng mặc định (pink-500)
  backgroundColor = "#e5e7eb", // Màu xám nhạt mặc định (gray-200)
  className,
  autoScroll = true,
}: DotLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Tự động cuộn xuống khi component được render
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
  
  // Độ trễ cho mỗi chấm để tạo hiệu ứng sóng
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
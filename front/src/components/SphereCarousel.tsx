"use client";

import React, { useState, useEffect, ReactNode } from "react";

interface SphereCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  autoRotateInterval?: number;
  itemSpacing?: number; // Espaçamento entre items em pixels
}

export default function SphereCarousel<T>({
  items,
  renderItem,
  itemHeight = 500,
  autoRotateInterval = 5000,
  itemSpacing = 55, // Espaçamento padrão: 55px entre items
}: SphereCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentHeight, setCurrentHeight] = useState(itemHeight);
  const [currentSpacing, setCurrentSpacing] = useState(itemSpacing);

  const itemCount = items.length;

  // Lógica de responsividade
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        // Mobile: Reduz para 50%
        setCurrentHeight(itemHeight * 0.5);
        setCurrentSpacing(itemSpacing * 0.5);
      } else if (width < 1024) {
        // Tablet: Reduz para 75%
        setCurrentHeight(itemHeight * 0.75);
        setCurrentSpacing(itemSpacing * 0.75);
      } else {
        // Notebook/Desktop: Tamanho original
        setCurrentHeight(itemHeight);
        setCurrentSpacing(itemSpacing);
      }
    };

    // Chamada inicial
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemHeight, itemSpacing]);

  // Calcula o ângulo por item (em graus)
  const theta = 360 / itemCount;

  // Calcula o raio do cilindro com espaçamento adicional
  // Aumentamos o raio para criar um espaço visual entre os items
  const radius =
    itemCount > 1
      ? (currentHeight * 0.5 + currentSpacing) / Math.tan(Math.PI / itemCount)
      : currentHeight * 2;

  // Rotação atual baseada no índice
  const rotation = currentIndex * theta;

  // Efeito para rotação automática
  useEffect(() => {
    if (autoRotateInterval <= 0 || itemCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [autoRotateInterval, itemCount]);

  if (itemCount === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{
        perspectiveOrigin: "center center",
      }}
    >
      {/* Container Rotativo */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-rotation}deg)`,
          transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
          height: `${currentHeight}px`,
        }}
      >
        {items.map((item, index) => {
          const itemRotation = index * theta;

          return (
            <div
              key={index}
              className="absolute flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${itemRotation}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
                height: `${currentHeight}px`,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

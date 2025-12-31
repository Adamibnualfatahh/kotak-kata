import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CanvasRefHandle, MemeCanvasProps } from '../types';

const MemeCanvas = forwardRef<CanvasRefHandle, MemeCanvasProps>(
  ({ 
    text, 
    width = 240, 
    fontSize = 42, 
    padding = 24,
    fontFamily = 'Arial',
    backgroundColor = '#ffffff',
    textColor = '#000000',
    backgroundImage = null
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Expose download and copy methods to parent
    useImperativeHandle(ref, () => ({
      downloadImage: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `kotakkata-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      },
      copyImageToClipboard: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
          const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, 'image/png')
          );
          if (!blob) throw new Error("Gagal membuat blob gambar");
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (error) {
          console.error("Gagal menyalin ke clipboard", error);
          throw error;
        }
      }
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderCanvas = (bgImgElement?: HTMLImageElement) => {
        // 1. Setup Canvas Dimensions (Strict 1:1 Square)
        const scale = 2; // Retina scaling
        const effectiveWidth = width * scale;
        const effectiveHeight = effectiveWidth; // Square
        const effectivePadding = padding * scale;
        const maxWidth = effectiveWidth - (effectivePadding * 2);
        const maxHeight = effectiveHeight - (effectivePadding * 2);

        canvas.width = effectiveWidth;
        canvas.height = effectiveHeight;

        // 2. Draw Background
        if (bgImgElement) {
          // Draw image with "cover" fit
          const ratio = Math.max(effectiveWidth / bgImgElement.width, effectiveHeight / bgImgElement.height);
          const centerShift_x = (effectiveWidth - bgImgElement.width * ratio) / 2;
          const centerShift_y = (effectiveHeight - bgImgElement.height * ratio) / 2;
          
          ctx.drawImage(
            bgImgElement, 
            0, 0, bgImgElement.width, bgImgElement.height,
            centerShift_x, centerShift_y, bgImgElement.width * ratio, bgImgElement.height * ratio
          );
          
          // Optional: Add slight overlay if text contrast might be low (can be made configurable later)
          // ctx.fillStyle = 'rgba(0,0,0,0.3)';
          // ctx.fillRect(0,0, effectiveWidth, effectiveHeight);
        } else {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Handle empty text
        if (text.trim() === '') return;

        // 3. Auto-Fit Logic (Shrink-to-Fit)
        const maxFontSize = fontSize * scale;
        const minFontSize = 14 * scale; 
        let currentFontSize = maxFontSize;
        let finalLines: string[][] = [];
        let finalLineHeight = 0;
        
        const words = text.split(/\s+/);

        // Loop downwards from max size to find the largest size that fits
        while (currentFontSize >= minFontSize) {
          ctx.font = `${currentFontSize}px ${fontFamily}, sans-serif`;
          const lineHeight = currentFontSize * 1.25;
          
          // Wrap logic
          const lines: string[][] = [];
          let currentLine: string[] = [];
          let currentLineWidth = 0;
          let fitsHorizontally = true;

          const spaceWidth = ctx.measureText(' ').width;

          for (const word of words) {
             const wordWidth = ctx.measureText(word).width;
             
             // Check if a single word is wider than the container
             if (wordWidth > maxWidth) {
                fitsHorizontally = false;
                break; 
             }

             const testWidth = currentLineWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
             
             if (testWidth <= maxWidth) {
                currentLine.push(word);
                currentLineWidth += wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
             } else {
                if (currentLine.length > 0) lines.push(currentLine);
                currentLine = [word];
                currentLineWidth = wordWidth;
             }
          }
          if (currentLine.length > 0) lines.push(currentLine);

          // Check vertical fit
          const totalHeight = lines.length * lineHeight;
          
          // If it fits both dimensions, we found our size
          if (fitsHorizontally && totalHeight <= maxHeight) {
             finalLines = lines;
             finalLineHeight = lineHeight;
             break;
          }

          currentFontSize -= 2; // Decrease step
        }
        
        // Fallback if loop finishes without fit (use min font size)
        if (finalLines.length === 0) {
           currentFontSize = minFontSize;
           ctx.font = `${currentFontSize}px ${fontFamily}, sans-serif`;
           finalLineHeight = currentFontSize * 1.25;
           const lines: string[][] = [];
           let currentLine: string[] = [];
           let currentLineWidth = 0;
           const spaceWidth = ctx.measureText(' ').width;
           words.forEach((word) => {
              const wordWidth = ctx.measureText(word).width;
              const testWidth = currentLineWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
              if (testWidth <= maxWidth) {
                currentLine.push(word);
                currentLineWidth += wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
              } else {
                if (currentLine.length > 0) lines.push(currentLine);
                currentLine = [word];
                currentLineWidth = wordWidth;
              }
           });
           if (currentLine.length > 0) lines.push(currentLine);
           finalLines = lines;
        }

        // 4. Draw Text (Justified & Vertically Centered)
        ctx.fillStyle = textColor;
        ctx.font = `${currentFontSize}px ${fontFamily}, sans-serif`;
        ctx.textBaseline = 'top';

        const totalTextHeight = finalLines.length * finalLineHeight;
        let yCursor = (effectiveHeight - totalTextHeight) / 2; // Vertical Center

        finalLines.forEach((lineWords, lineIndex) => {
          const isLastLine = lineIndex === finalLines.length - 1;
          const isSingleWord = lineWords.length === 1;

          if (isLastLine || isSingleWord) {
            // Left align for last line or single words
            let xCursor = effectivePadding;
            lineWords.forEach((word) => {
              ctx.fillText(word, xCursor, yCursor);
              const wordWidth = ctx.measureText(word).width;
              const spaceWidth = ctx.measureText(' ').width;
              xCursor += wordWidth + spaceWidth;
            });
          } else {
            // Full Justification
            const totalWordWidth = lineWords.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
            const availableSpace = maxWidth - totalWordWidth;
            const gaps = lineWords.length - 1;
            const gapWidth = gaps > 0 ? availableSpace / gaps : 0;

            let xCursor = effectivePadding;
            lineWords.forEach((word, wordIndex) => {
              ctx.fillText(word, xCursor, yCursor);
              const wordWidth = ctx.measureText(word).width;
              xCursor += wordWidth + (wordIndex < gaps ? gapWidth : 0);
            });
          }

          yCursor += finalLineHeight;
        });
      };

      // Loading logic for background image
      if (backgroundImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = backgroundImage;
        img.onload = () => renderCanvas(img);
        img.onerror = () => renderCanvas(); // Fallback if image fails
      } else {
        renderCanvas();
      }

    }, [text, width, fontSize, padding, fontFamily, backgroundColor, textColor, backgroundImage]);

    return (
      <div className="shadow-2xl border-4 border-gray-100 rounded-sm overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          style={{ width: `${width}px`, height: `${width}px`, display: 'block' }}
          className="mx-auto"
        />
      </div>
    );
  }
);

MemeCanvas.displayName = 'MemeCanvas';

export default MemeCanvas;

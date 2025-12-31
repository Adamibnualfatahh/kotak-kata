import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CanvasRefHandle, MemeCanvasProps } from '../types';

const MemeCanvas = forwardRef<CanvasRefHandle, MemeCanvasProps>(
  ({ 
    text, 
    width = 240, 
    fontSize = 42, 
    padding = 24,
    fontFamily = 'Arial',
    fontWeight = 'normal',
    backgroundColor = '#ffffff',
    textColor = '#000000',
    backgroundImage = null,
    isWeirdMode = false,
    weirdnessLevel = 1,
    randomSeed = 0,
    isSeriousMode = false,
    sticker = null,
    blurLevel = 0
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

    // Helper to generate weird lines based on seed
    const generateWeirdLines = (words: string[], level: number, seed: number): string[][] => {
      const lines: string[][] = [];
      let currentLine: string[] = [];
      
      // Simple pseudo-random using seed
      const random = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
      };

      // Calculate max words per line based on level (Level 5 = fewer words = more chaotic)
      // Level 1: 4-6 words, Level 5: 1-2 words
      const minWords = Math.max(1, 6 - level); 
      const maxWords = Math.max(2, 8 - level);

      let wordCountTarget = Math.floor(random(0) * (maxWords - minWords + 1)) + minWords;
      let wordCounter = 0;

      words.forEach((word, index) => {
        currentLine.push(word);
        wordCounter++;

        if (wordCounter >= wordCountTarget) {
          lines.push(currentLine);
          currentLine = [];
          wordCounter = 0;
          // New target for next line
          wordCountTarget = Math.floor(random(index) * (maxWords - minWords + 1)) + minWords;
        }
      });

      if (currentLine.length > 0) lines.push(currentLine);
      return lines;
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const renderCanvas = (bgImgElement?: HTMLImageElement) => {
        // Reset effects
        ctx.filter = 'none';
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // 1. Setup Canvas Dimensions
        const scale = 2; // Retina scaling
        const effectiveWidth = width * scale;
        const effectiveHeight = effectiveWidth; // Square
        
        // Adjust padding based on weirdness
        const activePadding = isWeirdMode 
          ? Math.max(10, padding - (weirdnessLevel * 2)) 
          : padding;
        
        const effectivePadding = activePadding * scale;
        const maxWidth = effectiveWidth - (effectivePadding * 2);
        const maxHeight = effectiveHeight - (effectivePadding * 2) - (isSeriousMode ? 40 : 0);

        canvas.width = effectiveWidth;
        canvas.height = effectiveHeight;

        // 2. Draw Background
        if (bgImgElement && !isSeriousMode) {
          const ratio = Math.max(effectiveWidth / bgImgElement.width, effectiveHeight / bgImgElement.height);
          const centerShift_x = (effectiveWidth - bgImgElement.width * ratio) / 2;
          const centerShift_y = (effectiveHeight - bgImgElement.height * ratio) / 2;
          
          ctx.drawImage(
            bgImgElement, 
            0, 0, bgImgElement.width, bgImgElement.height,
            centerShift_x, centerShift_y, bgImgElement.width * ratio, bgImgElement.height * ratio
          );
        } else {
          ctx.fillStyle = isSeriousMode ? '#f8f9fa' : backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Handle empty text
        if (text.trim() === '') return;

        // 3. Font Setup
        const activeFontFamily = isSeriousMode ? 'Merriweather' : fontFamily;
        const activeTextColor = isSeriousMode ? '#1a1a1a' : textColor;
        // Use provided fontWeight unless Serious mode is on (default logic)
        const activeFontWeight = isSeriousMode ? 'normal' : fontWeight; 

        // 4. Wrapping & Sizing Logic
        const maxFontSize = fontSize * scale;
        const minFontSize = 14 * scale; 
        let currentFontSize = maxFontSize;
        let finalLines: string[][] = [];
        let finalLineHeight = 0;
        
        const words = text.split(/\s+/);

        if (isWeirdMode) {
          // --- WEIRD MODE LOGIC ---
          const forcedLines = generateWeirdLines(words, weirdnessLevel, randomSeed);
          
          while (currentFontSize >= minFontSize) {
            ctx.font = `${activeFontWeight} ${currentFontSize}px ${activeFontFamily}, sans-serif`;
            const lineHeight = currentFontSize * (isSeriousMode ? 1.6 : (1.1 + (0.05 * weirdnessLevel))); 
            
            let fitsWidth = true;
            for (const line of forcedLines) {
              const lineStr = line.join(' ');
              if (ctx.measureText(lineStr).width > maxWidth) {
                fitsWidth = false;
                break;
              }
            }

            const totalHeight = forcedLines.length * lineHeight;
            
            if (fitsWidth && totalHeight <= maxHeight) {
              finalLines = forcedLines;
              finalLineHeight = lineHeight;
              break;
            }
            currentFontSize -= 2;
          }
           if (finalLines.length === 0) {
             finalLines = forcedLines;
             finalLineHeight = minFontSize * 1.2;
             currentFontSize = minFontSize;
           }

        } else {
          // --- NORMAL AUTO-FIT LOGIC ---
          while (currentFontSize >= minFontSize) {
            ctx.font = `${activeFontWeight} ${currentFontSize}px ${activeFontFamily}, sans-serif`;
            const lineHeight = currentFontSize * (isSeriousMode ? 1.6 : 1.25);
            
            const lines: string[][] = [];
            let currentLine: string[] = [];
            let currentLineWidth = 0;
            let fitsHorizontally = true;
            const spaceWidth = ctx.measureText(' ').width;

            for (const word of words) {
               const wordWidth = ctx.measureText(word).width;
               if (wordWidth > maxWidth) { fitsHorizontally = false; break; }
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
            const totalHeight = lines.length * lineHeight;
            if (fitsHorizontally && totalHeight <= maxHeight) {
               finalLines = lines;
               finalLineHeight = lineHeight;
               break;
            }
            currentFontSize -= 2;
          }
          if (finalLines.length === 0) {
             currentFontSize = minFontSize;
             finalLineHeight = currentFontSize * 1.25;
             let currentLine: string[] = [];
             let currentLineWidth = 0;
             const spaceWidth = ctx.measureText(' ').width;
             words.forEach(word => {
               const wordWidth = ctx.measureText(word).width;
               if (currentLineWidth + wordWidth <= maxWidth) {
                 currentLine.push(word);
                 currentLineWidth += wordWidth + spaceWidth;
               } else {
                 if (currentLine.length) finalLines.push(currentLine);
                 currentLine = [word];
                 currentLineWidth = wordWidth;
               }
             });
             if (currentLine.length) finalLines.push(currentLine);
          }
        }

        // 5. Render Text
        
        // BLUR FIX FOR IPHONE/SAFARI:
        // Use shadowBlur instead of filter for text, as it's universally supported
        // and doesn't suffer from context compositing issues on mobile.
        if (blurLevel > 0) {
          ctx.filter = `blur(${blurLevel}px)`; // Attempt modern way first
          ctx.shadowBlur = blurLevel * 2; // Fallback/Enhancement: Use shadow blur
          ctx.shadowColor = activeTextColor; // Shadow same color as text makes it look blurry
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.filter = 'none';
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        // Serious mode override for shadows
        if (isSeriousMode) {
           // If serious mode, use specific shadow style, override blur shadow
           ctx.shadowColor = "rgba(0,0,0,0.1)";
           ctx.shadowBlur = 10;
           ctx.shadowOffsetY = 5;
           ctx.filter = 'none'; // No blur in serious mode
        }

        ctx.fillStyle = activeTextColor;
        ctx.font = `${activeFontWeight} ${currentFontSize}px ${activeFontFamily}, sans-serif`;
        ctx.textBaseline = 'top';
        
        const totalTextHeight = finalLines.length * finalLineHeight;
        let yCursor = (effectiveHeight - totalTextHeight) / 2;
        
        if (isSeriousMode) yCursor -= 20;

        finalLines.forEach((lineWords, lineIndex) => {
          const isLastLine = lineIndex === finalLines.length - 1;
          const isSingleWord = lineWords.length === 1;
          
          let forceJustify = isWeirdMode && !isSingleWord;
          let standardLeft = (isLastLine || isSingleWord) && !forceJustify;

          if (standardLeft) {
            let xCursor = effectivePadding;
            lineWords.forEach((word) => {
              ctx.fillText(word, xCursor, yCursor);
              xCursor += ctx.measureText(word).width + ctx.measureText(' ').width;
            });
          } else {
            const totalWordWidth = lineWords.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
            const availableSpace = maxWidth - totalWordWidth;
            const gaps = lineWords.length - 1;
            const gapWidth = gaps > 0 ? availableSpace / gaps : 0;

            let xCursor = effectivePadding;
            lineWords.forEach((word, wordIndex) => {
              ctx.fillText(word, xCursor, yCursor);
              xCursor += ctx.measureText(word).width + (wordIndex < gaps ? gapWidth : 0);
            });
          }
          yCursor += finalLineHeight;
        });

        // Reset filter/shadow so stickers/footer are sharp
        ctx.filter = 'none';
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // 6. Serious Mode Caption
        if (isSeriousMode) {
          ctx.fillStyle = "#666666";
          ctx.font = `italic normal ${12 * scale}px Merriweather, serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("Dibuat dengan penuh pertimbangan moral.", effectiveWidth / 2, effectiveHeight - (effectivePadding / 2));
        }

        // 7. Sticker
        if (sticker) {
          ctx.font = `normal ${40 * scale}px Arial`; 
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.shadowColor = "rgba(0,0,0,0.2)";
          ctx.shadowBlur = 4;
          ctx.fillText(sticker, effectiveWidth - (effectivePadding/2), effectiveHeight - (effectivePadding/2));
        }
      };

      if (backgroundImage && !isSeriousMode) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = backgroundImage;
        img.onload = () => renderCanvas(img);
        img.onerror = () => renderCanvas();
      } else {
        renderCanvas();
      }

    }, [text, width, fontSize, padding, fontFamily, fontWeight, backgroundColor, textColor, backgroundImage, isWeirdMode, weirdnessLevel, randomSeed, isSeriousMode, sticker, blurLevel]);

    return (
      <div className={`shadow-2xl border-4 ${isSeriousMode ? 'border-gray-800' : 'border-gray-100'} rounded-sm overflow-hidden bg-white transition-all duration-500`}>
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
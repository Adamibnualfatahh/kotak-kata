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
    blurLevel = 0,
    aspectRatio = 'square',
    onQualityAlert
  }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // --- Helper Functions ---

    const getBlob = async (): Promise<Blob | null> => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    };

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
          const blob = await getBlob();
          if (!blob) throw new Error("Gagal membuat blob gambar");
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        } catch (error) {
          console.error("Gagal menyalin ke clipboard", error);
          throw error;
        }
      },
      shareImage: async (platform) => {
        try {
          const blob = await getBlob();
          if (!blob) return;

          const shareText = "dibikin pakai KotakKata https://kotak-kata.vercel.app/";
          const file = new File([blob], "kotakkata.png", { type: "image/png" });
          
          const shareData: ShareData = {
            files: [file],
            title: 'KotakKata',
            text: shareText,
          };

          // Prioritize Web Share API (Mobile)
          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            // Fallback for Desktop: Copy + Open Intent
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            let url = '';
            const caption = encodeURIComponent(shareText);
            
            if (platform === 'twitter') {
                url = `https://twitter.com/intent/tweet?text=${caption}`;
            } else if (platform === 'whatsapp') {
                url = `https://wa.me/?text=${caption}`;
            }
            
            if (url) {
                alert("Gambar telah disalin ke clipboard! Silakan paste saat membagikan.");
                window.open(url, '_blank');
            }
          }
        } catch (err) {
          console.error("Error sharing:", err);
        }
      }
    }));

    // Helper to generate weird lines based on seed
    const generateWeirdLines = (words: string[], level: number, seed: number): string[][] => {
      const lines: string[][] = [];
      let currentLine: string[] = [];
      
      const random = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
      };

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
          wordCountTarget = Math.floor(random(index) * (maxWords - minWords + 1)) + minWords;
        }
      });

      if (currentLine.length > 0) lines.push(currentLine);
      return lines;
    };

    // --- RENDER EFFECT ---
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
        // Aspect Ratio Logic
        const effectiveHeight = aspectRatio === 'story' 
            ? (effectiveWidth * 16) / 9 
            : effectiveWidth; // Square default

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
          // Fill background color first (fallback)
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Cover logic
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

        // Anti Jelek Guard: Length Check
        if (text.length > 250 && onQualityAlert) {
             onQualityAlert("Biar lebih enak dilihat, coba dipendekin dikit 🙂");
        } else if (onQualityAlert) {
             onQualityAlert(null); // Clear alert
        }

        if (text.trim() === '') return;

        // 3. Font Setup
        const activeFontFamily = isSeriousMode ? 'Merriweather' : fontFamily;
        const activeTextColor = isSeriousMode ? '#1a1a1a' : textColor;
        const activeFontWeight = isSeriousMode ? 'normal' : fontWeight; 

        // 4. Wrapping & Sizing Logic
        const maxFontSize = fontSize * scale;
        const minFontSize = 14 * scale; 
        let currentFontSize = maxFontSize;
        let finalLines: string[][] = [];
        let finalLineHeight = 0;
        
        const words = text.split(/\s+/);

        if (isWeirdMode) {
          // --- WEIRD MODE LOGIC (Chaotic) ---
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
          // --- NORMAL AUTO-FIT + ANTI JELEK SMART WRAPPING ---
          while (currentFontSize >= minFontSize) {
            ctx.font = `${activeFontWeight} ${currentFontSize}px ${activeFontFamily}, sans-serif`;
            const lineHeight = currentFontSize * (isSeriousMode ? 1.6 : 1.25);
            
            // Temporary variable for lines in this iteration
            const lines: string[][] = [];
            let currentLine: string[] = [];
            let currentLineWidth = 0;
            let fitsHorizontally = true;
            const spaceWidth = ctx.measureText(' ').width;

            for (const word of words) {
               const wordWidth = ctx.measureText(word).width;
               if (wordWidth > maxWidth) { fitsHorizontally = false; break; }
               
               const potentialWidth = currentLineWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0);
               
               if (potentialWidth <= maxWidth) {
                  currentLine.push(word);
                  currentLineWidth = potentialWidth;
               } else {
                  if (currentLine.length > 0) lines.push(currentLine);
                  currentLine = [word];
                  currentLineWidth = wordWidth;
               }
            }
            if (currentLine.length > 0) lines.push(currentLine);

            // ANTI JELEK GUARD: ORPHAN PREVENTION
            // If the last line is a single word and previous line has multiple words,
            // try to move one word down to balance it, IF it doesn't break height constraints.
            if (lines.length > 1) {
                const lastLine = lines[lines.length - 1];
                const prevLine = lines[lines.length - 2];
                
                if (lastLine.length === 1 && prevLine.length > 2) {
                    const wordToMove = prevLine.pop();
                    if (wordToMove) {
                        lastLine.unshift(wordToMove);
                        // Re-calculate width of prevLine is technically needed for justification logic later,
                        // but for sizing check, we just need to know it fits (it became shorter, so it fits).
                    }
                }
            }

            const totalHeight = lines.length * lineHeight;
            if (fitsHorizontally && totalHeight <= maxHeight) {
               finalLines = lines;
               finalLineHeight = lineHeight;
               break;
            }
            currentFontSize -= 2;
          }
          
          // Fallback if smallest font still doesn't fit (just force wrap)
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
        if (blurLevel > 0) {
          ctx.filter = `blur(${blurLevel}px)`;
          ctx.shadowBlur = blurLevel * 2;
          ctx.shadowColor = activeTextColor;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else {
          ctx.filter = 'none';
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }

        if (isSeriousMode) {
           ctx.shadowColor = "rgba(0,0,0,0.1)";
           ctx.shadowBlur = 10;
           ctx.shadowOffsetY = 5;
           ctx.filter = 'none';
        }

        ctx.fillStyle = activeTextColor;
        ctx.font = `${activeFontWeight} ${currentFontSize}px ${activeFontFamily}, sans-serif`;
        ctx.textBaseline = 'top';
        
        const totalTextHeight = finalLines.length * finalLineHeight;
        // Vertically Center
        let yCursor = (effectiveHeight - totalTextHeight) / 2;
        
        if (isSeriousMode) yCursor -= 20;

        finalLines.forEach((lineWords, lineIndex) => {
          const isLastLine = lineIndex === finalLines.length - 1;
          const isSingleWord = lineWords.length === 1;
          
          // In Weird Mode, random justification. In Normal, justify everything except last line/single words.
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

        // Reset filter/shadow
        ctx.filter = 'none';
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // 6. Footer / Sticker
        if (isSeriousMode) {
          ctx.fillStyle = "#666666";
          ctx.font = `italic normal ${12 * scale}px Merriweather, serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText("Dibuat dengan penuh pertimbangan moral.", effectiveWidth / 2, effectiveHeight - (effectivePadding / 2));
        }

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

    }, [text, width, fontSize, padding, fontFamily, fontWeight, backgroundColor, textColor, backgroundImage, isWeirdMode, weirdnessLevel, randomSeed, isSeriousMode, sticker, blurLevel, aspectRatio, onQualityAlert]);

    // Determine wrapper height based on aspect ratio
    const wrapperHeightClass = aspectRatio === 'story' ? 'aspect-[9/16]' : 'aspect-square';

    return (
      <div className={`shadow-2xl border-4 ${isSeriousMode ? 'border-gray-800' : 'border-gray-100'} rounded-sm overflow-hidden bg-white transition-all duration-500`}>
        <canvas
          ref={canvasRef}
          // We rely on CSS aspectRatio for the container, but here we set explicit pixel sizes for high DPI
          // The CSS handles the responsiveness.
          style={{ width: '100%', height: 'auto', display: 'block' }}
          className="mx-auto"
        />
      </div>
    );
  }
);

MemeCanvas.displayName = 'MemeCanvas';

export default MemeCanvas;
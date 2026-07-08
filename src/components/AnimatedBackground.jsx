import React, { useEffect, useRef } from 'react';

const AnimatedBackground = ({ customColor = null }) => {
    const canvasRef = useRef(null);
    const colorRef = useRef("255, 255, 255");

    useEffect(() => {
        const updateColor = () => {
            if (customColor) {
                colorRef.current = customColor;
            } else {
                // Check if the html tag has the 'dark' class
                const isDark = document.documentElement.classList.contains('dark');
                colorRef.current = isDark ? "255, 255, 255" : "0, 120, 212"; // Primary blue for light mode
            }
        };

        // Initial color setup
        updateColor();

        // Observe theme changes
        const observer = new MutationObserver(updateColor);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let particlesArray = [];

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', setCanvasSize);
        setCanvasSize();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Faster speed for a more dynamic look
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
                if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;
            }
            draw() {
                // Not drawing the dots, only the lines, to match the geometric style of the second image
            }
        }

        const init = () => {
            particlesArray = [];
            // Less particles for cleaner geometric look
            let numberOfParticles = (canvas.height * canvas.width) / 15000;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Connect if close enough
                    if (distance < 200) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${colorRef.current}, ${0.4 - distance / 500})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, [customColor]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
    );
};

export default AnimatedBackground;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle System (Starfield)
    initStarfield();

    // 2. Intersection Observer for Scroll Animation
    initScrollAnimation();

    // 3. Hero Entrance Animation
    initHeroAnimation();

    // 4. Slideshow
    initSlideshow();

    // 5. Blur Effect
    initBlurEffect();
});

/**
 * A. 背景パーティクル (HTML5 Canvas API)
 */
function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let stars = [];

    // Configuration
    const baseStarCount = 200; // Base count for 1920x1080
    const speedFactor = 0.05;

    // Mouse Tracking
    let mouse = { x: null, y: null };
    let isWarping = false; // Warp effect state

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Scroll listener for Warp Effect
    window.addEventListener('scroll', () => {
        const conceptSection = document.getElementById('concept');
        if (conceptSection) {
            const rect = conceptSection.getBoundingClientRect();
            // Check if center of section is near center of viewport
            const sectionCenter = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;

            // Activate warp if section is roughly in the middle
            if (Math.abs(sectionCenter - viewportCenter) < window.innerHeight * 0.3) {
                isWarping = true;
            } else {
                isWarping = false;
            }
        }
    });

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height;
            this.z = Math.random() * 2; // Depth simulation
            this.size = Math.random() * 2 + 0.1; // 0.1 to 2.1
            this.baseSpeed = (Math.random() * 0.5 + 0.1) * speedFactor * 10 * (this.z + 1);

            // Velocity vectors
            this.vx = 0;
            this.vy = -this.baseSpeed; // Initial upward drift

            this.opacity = Math.random();
            this.blinkSpeed = Math.random() * 0.02 + 0.005;
            this.blinkDir = 1;

            // Attraction lifecycle
            this.gatheredTime = 0;
            this.maxGatheredTime = Math.random() * 100 + 50; // frames
        }

        update() {
            if (isWarping) {
                // Warp mode behavior: fast vertical streak
                this.vy = -this.baseSpeed * 40; // Super fast
                this.x += (width/2 - this.x) * 0.01; // Converge slightly to center top? Or just straight up
                // Actually, warp usually is radial. But to keep it simple and consistent with vertical flow:
                // Fast acceleration upwards.

                this.y += this.vy;

                // Wrap around quickly
                if (this.y < 0) {
                    this.y = height;
                    this.x = Math.random() * width;
                }
                return;
            }

            // Mouse Attraction Logic
            let attracted = false;
            if (mouse.x != null && mouse.y != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 400; // Attraction range

                if (distance < maxDistance) {
                    attracted = true;
                    const force = (maxDistance - distance) / maxDistance;
                    const attractionStrength = 0.5; // Adjust strength

                    const angle = Math.atan2(dy, dx);

                    this.vx += Math.cos(angle) * force * attractionStrength;
                    this.vy += Math.sin(angle) * force * attractionStrength;
                }
            }

            // Gathered lifecycle
            if (attracted) {
                this.gatheredTime++;
                if (this.gatheredTime > this.maxGatheredTime) {
                    // "Die" and reset if gathered for too long
                    this.opacity -= 0.05;
                    if (this.opacity <= 0) {
                        this.reset();
                    }
                }
            } else {
                this.gatheredTime = Math.max(0, this.gatheredTime - 1);
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Friction (decay velocity to return to normal state slowly)
            this.vx *= 0.95;

            // Return to natural upward drift
            // Interpolate vy back to -this.baseSpeed
            this.vy = this.vy * 0.95 + (-this.baseSpeed) * 0.05;

            // Blink effect
            this.opacity += this.blinkSpeed * this.blinkDir;
            if (this.opacity >= 1 || this.opacity <= 0.2) {
                this.blinkDir *= -1;
            }

            // Reset if out of screen (top) or too far sides
            // Since we have mouse interaction, stars might go off sides or bottom
            if (this.y < -50 || this.y > height + 50 || this.x < -50 || this.x > width + 50) {
                 // Only reset if it's far out, mainly top for drift
                 if (this.y < -50) {
                     this.reset();
                     this.y = height + 10;
                 } else if (this.y > height + 50) {
                    this.y = -10; // Wrap vertical
                 }

                 if (this.x < -50) this.x = width + 50;
                 if (this.x > width + 50) this.x = -50;
            }
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();

            if (isWarping) {
                // Draw streak
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + 40); // Trail length
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = this.size;
                ctx.stroke();
            } else {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Adjust star count based on screen area
        const area = width * height;
        const refArea = 1920 * 1080;
        const count = Math.floor(baseStarCount * (area / refArea));

        // Re-init stars
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push(new Star());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/**
 * B. スクロール連動フェードイン (Intersection Observer API)
 */
function initScrollAnimation() {
    const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, options);

    // Target fade-up, fade-in, and space-reveal classes
    const targets = document.querySelectorAll('.fade-up, .fade-in, .space-reveal');
    targets.forEach(target => {
        observer.observe(target);
    });
}

/**
 * C. Hero Section Entrance
 */
function initHeroAnimation() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('visible');
        }, 500);
    }
}

/**
 * D. Slideshow Animation
 */
function initSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const interval = 5000; // 5 seconds per slide

    // Start rotation
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, interval);
}

/**
 * E. Blur Effect (CodePen Port)
 */
function initBlurEffect() {
    const blurContainer = document.querySelector('.blur');
    if (!blurContainer) return;

    // Configuration for the blur effect
    const config = {
        layers: 5,
        blur: 40,
        mask: 25, // Percentage where the mask stops/starts
    };

    // Apply CSS variables to the container
    blurContainer.style.setProperty('--layers', config.layers);
    blurContainer.style.setProperty('--blur-max', config.blur);
    blurContainer.style.setProperty('--mask-stop', config.mask);

    // Generate layers
    const layersHTML = new Array(config.layers)
        .fill()
        .map((_, index) => {
            return `<div style="--i: ${index + 1};"></div>`;
        })
        .join('');

    blurContainer.innerHTML = layersHTML;
}

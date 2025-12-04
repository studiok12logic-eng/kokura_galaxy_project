document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle System (Starfield)
    initStarfield();

    // 2. Intersection Observer for Scroll Animation
    initScrollAnimation();

    // 3. Hero Entrance Animation
    initHeroAnimation();
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

    class Star {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height;
            this.z = Math.random() * 2; // Depth simulation
            this.size = Math.random() * 2 + 0.1;
            this.speed = (Math.random() * 0.5 + 0.1) * speedFactor * 10 * (this.z + 1); // Closer stars move faster
            this.opacity = Math.random();
            this.blinkSpeed = Math.random() * 0.02 + 0.005;
            this.blinkDir = 1;
        }

        update() {
            this.y -= this.speed;

            // Blink effect
            this.opacity += this.blinkSpeed * this.blinkDir;
            if (this.opacity >= 1 || this.opacity <= 0.2) {
                this.blinkDir *= -1;
            }

            // Reset if out of screen
            if (this.y < 0) {
                this.reset();
            }
        }

        draw() {
            // Parallax effect based on scroll Y could be added here
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
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

        // Re-init stars if count changes significantly or just ensure we have enough
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

    // Target both fade-up and fade-in classes
    const targets = document.querySelectorAll('.fade-up, .fade-in');
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

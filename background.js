const canvas = document.getElementById('starsBackground');
if (canvas) {
    const ctx = canvas.getContext('2d');

    const STAR_COUNT = 400;
    const STAR_SIZE = 1.5; // Radius in pixels

    // Define colors for slow and fast stars
    const SLOW_STAR_COLOR = { r: 75, g: 9, b: 115 }; // Purple
    const FAST_STAR_COLOR = { r: 250, g: 26, b: 142 }; // Pink

    // Linearly interpolates between two colors
    const lerpColor = (factor) => {
        const r = SLOW_STAR_COLOR.r + factor * (FAST_STAR_COLOR.r - SLOW_STAR_COLOR.r);
        const g = SLOW_STAR_COLOR.g + factor * (FAST_STAR_COLOR.g - SLOW_STAR_COLOR.g);
        const b = SLOW_STAR_COLOR.b + factor * (FAST_STAR_COLOR.b - SLOW_STAR_COLOR.b);
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    // A simple pseudo-random number generator to create deterministic properties for each star.
    // It takes a seed (the star's index) and returns a value between 0 and 1.
    const pseudoRandom = (seed) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const draw = () => {
        const now = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const baseSpeed = 20; // pixels per second
        const speedRange = 30;

        for (let i = 0; i < STAR_COUNT; i++) {
            // Use the star's index as a seed for deterministic "randomness"
            const seed1 = pseudoRandom(i + 1);
            const seed2 = pseudoRandom(i + 2);
            const seed3 = pseudoRandom(i + 3);

            // Base speed and a random multiplier for variation
            const speed = baseSpeed + seed1 * speedRange; // Varies from 20 to 50

            // Normalize speed to a 0-1 range for color interpolation
            const speedFactor = (speed - baseSpeed) / speedRange;
            ctx.fillStyle = lerpColor(speedFactor);

            // Initial position offset, so stars don't all start at (0,0)
            const initialX = canvas.width * seed2;
            const initialY = canvas.height * seed3;

            // Calculate current position based on time
            // The time component is divided to slow down the animation
            const timeComponent = now / 1000; // use seconds
            const x = (initialX + timeComponent * speed) % canvas.width;
            const y = (initialY + timeComponent * speed) % canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, STAR_SIZE, 0, 2 * Math.PI);
            ctx.fill();
        }

        requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();
    draw();
}
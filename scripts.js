const canvas = document.getElementById('solarSystemCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');

let canvasWidth, canvasHeight, centerX, centerY;
let scale = 1;
let planets = [];
let stars = [];

const SUN_RADIUS_PIXELS = 25;
const ORBIT_SCALE_FACTOR = 1.3;
const PLANET_SIZE_SCALE = 0.9;
const BASE_ORBIT_SPEED = 0.002;
const STAR_COUNT = 500;

const celestialBodiesData = [
    { name: "Mercury", color: "#8B4513", lightColor: "#B8860B", radius: 2 * PLANET_SIZE_SCALE, orbitRadius: 45 * ORBIT_SCALE_FACTOR, speedFactor: 1.6 },
    { name: "Venus", color: "#BDB76B", lightColor: "#F0E68C", radius: 4 * PLANET_SIZE_SCALE, orbitRadius: 75 * ORBIT_SCALE_FACTOR, speedFactor: 1.15 },
    { name: "Earth", color: "#4682B4", lightColor: "#87CEEB", radius: 4.5 * PLANET_SIZE_SCALE, orbitRadius: 105 * ORBIT_SCALE_FACTOR, speedFactor: 1 },
    { name: "Mars", color: "#CD5C5C", lightColor: "#FFA07A", radius: 3 * PLANET_SIZE_SCALE, orbitRadius: 160 * ORBIT_SCALE_FACTOR, speedFactor: 0.8 },
    { name: "Jupiter", color: "#D2B48C", lightColor: "#FFDEAD", radius: 14 * PLANET_SIZE_SCALE, orbitRadius: 280 * ORBIT_SCALE_FACTOR, speedFactor: 0.45 },
    { name: "Saturn", color: "#F4A460", lightColor: "#FFDAB9", radius: 11 * PLANET_SIZE_SCALE, orbitRadius: 400 * ORBIT_SCALE_FACTOR, speedFactor: 0.32, ringColor: "#A08C78" },
    { name: "Uranus", color: "#AFEEEE", lightColor: "#E0FFFF", radius: 8 * PLANET_SIZE_SCALE, orbitRadius: 500 * ORBIT_SCALE_FACTOR, speedFactor: 0.23 },
    { name: "Neptune", color: "#4169E1", lightColor: "#ADD8E6", radius: 7.5 * PLANET_SIZE_SCALE, orbitRadius: 600 * ORBIT_SCALE_FACTOR, speedFactor: 0.18 },
];

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function initialize() {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const padding = 60;
    const maxOrbit = Math.max(...celestialBodiesData.map(p => p.orbitRadius));
    const requiredSize = (maxOrbit + SUN_RADIUS_PIXELS + padding) * 2;

    const scaleX = containerWidth / requiredSize;
    const scaleY = containerHeight / requiredSize;
    scale = Math.min(scaleX, scaleY, 1);

    canvasWidth = Math.min(containerWidth, requiredSize * scale);
    canvasHeight = Math.min(containerHeight, requiredSize * scale);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    centerX = canvasWidth / 2;
    centerY = canvasHeight / 2;

    planets = celestialBodiesData.map(data => ({
        ...data,
        angle: getRandom(0, Math.PI * 2),
        speed: BASE_ORBIT_SPEED * data.speedFactor,
        currentOrbitRadius: data.orbitRadius * scale,
        currentRadius: Math.max(1.5, data.radius * Math.sqrt(scale))
    }));

    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            size: getRandom(0.5, 1.5),
            alpha: getRandom(0.3, 1.0)
        });
    }

    console.log(`Initialized Solar System. Canvas: ${canvasWidth}x${canvasHeight}, Scale: ${scale.toFixed(3)}`);
}

function drawStars() {
    ctx.save();
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function drawSun() {
    const sunRadius = SUN_RADIUS_PIXELS * Math.max(0.6, Math.sqrt(scale));

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
    gradient.addColorStop(0, '#FFFACD');
    gradient.addColorStop(0.6, '#FFD700');
    gradient.addColorStop(1, '#FFA500');

    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = sunRadius * 2.5;

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
}

function drawPlanet(planet) {
    const x = centerX + planet.currentOrbitRadius * Math.cos(planet.angle);
    const y = centerY + planet.currentOrbitRadius * Math.sin(planet.angle);
    const radius = planet.currentRadius;

    ctx.strokeStyle = 'rgba(100, 100, 100, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, planet.currentOrbitRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (planet.ringColor) {
        ctx.strokeStyle = planet.ringColor;
        ctx.lineWidth = Math.max(1, radius * 0.3);
        ctx.beginPath();
        const ringTilt = Math.PI / 10;
        ctx.ellipse(
            x, y,
            radius * 2.0,
            radius * 0.8,
            ringTilt,
            0, Math.PI * 2
        );
        ctx.stroke();
    }

    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const gradientOffsetX = (dx / dist) * radius * 0.4;
    const gradientOffsetY = (dy / dist) * radius * 0.4;

    const lightGradient = ctx.createRadialGradient(
        x - gradientOffsetX, y - gradientOffsetY, radius * 0.1,
        x, y, radius * 1.5
    );

    lightGradient.addColorStop(0, planet.lightColor || planet.color);
    lightGradient.addColorStop(0.7, planet.color);
    lightGradient.addColorStop(1, `rgba(0, 0, 0, 0.3)`);

    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    drawStars();

    drawSun();

    planets.forEach(planet => {
        planet.angle += planet.speed;
        if (planet.angle > Math.PI * 2) {
            planet.angle -= Math.PI * 2;
        }
        drawPlanet(planet);
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', initialize);

initialize();
animate();

const cursor = {
  x: undefined,
  y: undefined,
  radius: 100,
};

class WaterParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0.5;
    this.friction = 0.99;
  }

  update(particles) {
    // Применяем гравитацию
    this.velocityY += this.gravity;

    // Отталкивание от курсора
    if (cursor.x !== undefined && cursor.y !== undefined) {
      const dx = this.x - cursor.x;
      const dy = this.y - cursor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < cursor.radius) {
        const angle = Math.atan2(dy, dx);
        const force = (cursor.radius - distance) / cursor.radius;

        this.velocityX += Math.cos(angle) * force * 2;
        this.velocityY += Math.sin(angle) * force * 2;
      }
    }

    // Обновляем позицию
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Коллизия со стенами
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.velocityX *= -0.5;
    }
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.velocityX *= -0.5;
    }
    if (this.y + this.radius > canvas.height) {
      this.y = canvas.height - this.radius;
      this.velocityY *= -0.5;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocityY *= -0.5;
    }

    // Коллизия с другими частицами
    particles.forEach((particle) => {
      if (particle === this) return;

      const dx = particle.x - this.x;
      const dy = particle.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 50) {
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      }

      const minDistance = this.radius + particle.radius;

      if (distance < minDistance) {
        // Увеличиваем силу отталкивания
        const angle = Math.atan2(dy, dx);
        const targetX = this.x + Math.cos(angle) * minDistance;
        const targetY = this.y + Math.sin(angle) * minDistance;

        // Увеличиваем коэффициент отталкивания с 0.05 до 0.5
        const ax = (targetX - particle.x) * 0.5;
        const ay = (targetY - particle.y) * 0.5;

        this.velocityX -= ax;
        this.velocityY -= ay;
        particle.velocityX += ax;
        particle.velocityY += ay;

        // Добавляем минимальное расстояние между частицами
        const overlap = minDistance - distance;
        const moveX = (overlap * dx) / distance / 2;
        const moveY = (overlap * dy) / distance / 2;

        this.x -= moveX;
        this.y -= moveY;
        particle.x += moveX;
        particle.y += moveY;
      }
    });

    // Применяем трение
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 150, 255, 0.8)';
    ctx.fill();
  }
}

// Инициализация канваса
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Устанавливаем размеры канваса
canvas.width = 900;
canvas.height = 600;

// Создаем массив частиц
const particles = [];
for (let i = 0; i < 500; i++) {
  particles.push(
    new WaterParticle(
      Math.random() * canvas.width,
      (Math.random() * canvas.height) / 2
    )
  );
}

// Анимация
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update(particles);
    particle.draw(ctx);
  });

  requestAnimationFrame(animate);
}

animate();

// Обработка изменения размера окна

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX;
  cursor.y = event.clientY;
});

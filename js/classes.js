const canvas = document.querySelector('canvas')

export class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
      x: 0,
      y: 0
    }
    this.powerUp
  }

  draw(c) {
    // Glow effect
    c.shadowBlur = 20 // Adjust for more or less glow
    c.shadowColor = this.color

    // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)

    const pixelSize = 4 // Size of each pixel block
    for (let y = -this.radius; y <= this.radius; y += pixelSize) {
      for (let x = -this.radius; x <= this.radius; x += pixelSize) {
        const distance = Math.sqrt(x * x + y * y)
        if (distance <= this.radius) {
          c.fillStyle = this.color
          c.fillRect(this.x + x, this.y + y, pixelSize, pixelSize)
        }
      }
    }

    // // Jagged circle
    // c.beginPath();
    // const spikes = 20; // Number of jagged points
    // const jaggedness = 0.4; // Adjust for more or less jaggedness
    // for (let i = 0; i < spikes; i++) {
    //   const angle = (i / spikes) * Math.PI * 2;
    //   const distance =
    //     this.radius + Math.random() * this.radius * jaggedness;
    //   const x = this.x + Math.cos(angle) * distance;
    //   const y = this.y + Math.sin(angle) * distance;
    //   if (i === 0) c.moveTo(x, y);
    //   else c.lineTo(x, y);
    // }
    // c.closePath();

    // Fill with color
    c.fillStyle = this.color
    c.fill()

    // Reset shadow
    c.shadowBlur = 0
  }

  update(c) {
    this.draw(c)

    const friction = 0.99

    this.velocity.x *= friction
    this.velocity.y *= friction

    if (
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }

    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }
}

export class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw(c) {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update(c) {
    this.draw(c)
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

export class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'Linear'
    this.radians = 0
    this.center = {
      x,
      y
    }

    if (Math.random() < 0.5) {
      this.type = 'Homing'

      if (Math.random() < 0.5) {
        this.type = 'Spinning'

        if (Math.random() < 0.5) {
          this.type = 'Homing Spinning'
        }
      }
    }
  }

  draw(c) {
    const pixelSize = 4 // Size of each pixel block
    for (let y = -this.radius; y <= this.radius; y += pixelSize) {
      for (let x = -this.radius; x <= this.radius; x += pixelSize) {
        const distance = Math.sqrt(x * x + y * y)
        if (distance <= this.radius) {
          c.fillStyle = this.color
          c.fillRect(this.x + x, this.y + y, pixelSize, pixelSize)
        }
      }
    }

    // // Jagged circle
    // c.beginPath();
    // const spikes = 20; // Number of jagged points
    // const jaggedness = 0.4; // Adjust for more or less jaggedness
    // for (let i = 0; i < spikes; i++) {
    //   const angle = (i / spikes) * Math.PI * 2;
    //   const distance =
    //     this.radius + Math.random() * this.radius * jaggedness;
    //   const x = this.x + Math.cos(angle) * distance;
    //   const y = this.y + Math.sin(angle) * distance;
    //   if (i === 0) c.moveTo(x, y);
    //   else c.lineTo(x, y);
    // }
    // c.closePath();

    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update(c, player) {
    this.draw(c)

    if (this.type === 'Spinning') {
      this.radians += 0.1

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 30
      this.y = this.center.y + Math.sin(this.radians) * 30
    } else if (this.type === 'Homing') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    } else if (this.type === 'Homing Spinning') {
      this.radians += 0.1

      const angle = Math.atan2(
        player.y - this.center.y,
        player.x - this.center.x
      )
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 30
      this.y = this.center.y + Math.sin(this.radians) * 30
    } else {
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    }
  }
}

const friction = 0.99
export class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw(c) {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update(c) {
    this.draw(c)
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

export class BackgroundParticle {
  constructor({ position, radius = 3, color = 'blue' }) {
    this.position = position
    this.radius = radius
    this.color = color
    this.alpha = 0.1
  }

  draw(c) {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
}

export class PowerUp {
  constructor({ position = { x: 0, y: 0 }, velocity }) {
    this.position = position
    this.velocity = velocity

    this.image = new Image()
    this.image.src = './img/lightningBolt.png'

    this.alpha = 1
    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'linear'
    })

    this.radians = 0
  }

  draw(c) {
    c.save()
    c.globalAlpha = this.alpha
    c.translate(
      this.position.x + this.image.width / 2,
      this.position.y + this.image.height / 2
    )
    c.rotate(this.radians)
    c.translate(
      -this.position.x - this.image.width / 2,
      -this.position.y - this.image.height / 2
    )
    c.drawImage(this.image, this.position.x, this.position.y)
    c.restore()
  }

  update(c) {
    this.draw(c)
    this.radians += 0.01
    this.position.x += this.velocity.x
  }
}

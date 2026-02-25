// import './style.css';
import { audio } from './js/audio.js'
import {
  Player,
  Projectile,
  Enemy,
  Particle,
  BackgroundParticle,
  PowerUp
} from './js/classes.js'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEl = document.querySelector('#scoreEl')
const highScoreEl = document.querySelector('#highScoreEl')
const modalEl = document.querySelector('#modalEl')
const modalScoreEl = document.querySelector('#modalScoreEl')
const buttonEl = document.querySelector('#buttonEl')
const startButtonEl = document.querySelector('#startButtonEl')
const startModalEl = document.querySelector('#startModalEl')
const volumeUpEl = document.querySelector('#volumeUpEl')
const volumeOffEl = document.querySelector('#volumeOffEl')

canvas.width = innerWidth
canvas.height = innerHeight

let player
let projectiles = []
let enemies = []
let particles = []
let animationId
let intervalId
let spawnPowerUpsId
let score = 0
let powerUps = []
let frames = 0
let backgroundParticles = []
let game = {
  active: false
}

// c.imageSmoothingEnabled = false

function init() {
  const x = canvas.width / 2
  const y = canvas.height / 2
  player = new Player(x, y, 10, '#00ff00')
  projectiles = []
  enemies = []
  particles = []
  powerUps = []
  score = 0
  scoreEl.innerHTML = 0
  highScoreEl.innerHTML =
    localStorage.getItem('highScore') ||
    (localStorage.setItem('highScore', 0), 0)
  frames = 0
  backgroundParticles = []
  game = {
    active: true
  }

  const spacing = 30
  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      backgroundParticles.push(
        new BackgroundParticle({
          position: {
            x,
            y
          },
          radius: 3,
          color: '#001100'
        })
      )
    }
  }
}

/**
 * Determines game difficulty parameters based on current player score.
 * The difficulty progresses through 5 stages:
 * 
 * Stage 1 (0-5000 pts): Beginner - Easy introduction
 *   - Spawn rate: 1500ms (slower spawning)
 *   - Speed: 0.5x (half normal speed)
 *   - Enemy types: Linear only (no tracking/projectile enemies)
 * 
 * Stage 2 (5000-10000 pts): Intermediate - First challenge
 *   - Spawn rate: 1200ms
 *   - Speed: 0.75x
 *   - Enemy types: 60% Linear, 40% Homing (tracking enemies appear)
 * 
 * Stage 3 (10000-20000 pts): Advanced - Full variety
 *   - Spawn rate: 1000ms (original spawn rate)
 *   - Speed: 1.0x (normal speed)
 *   - Enemy types: 50% Linear, 30% Homing, 20% Spinning
 * 
 * Stage 4 (20000-50000 pts): Expert - Intensified
 *   - Spawn rate: 800ms (faster spawning)
 *   - Speed: 1.2x (above normal)
 *   - Enemy types: All types available including Homing-Spinning combo (10%)
 * 
 * Stage 5 (50000+ pts): Master - Maximum challenge
 *   - Spawn rate: 600ms (maximum spawn rate)
 *   - Speed: 1.5x (50% faster)
 *   - Enemy types: More aggressive mix with fewer Linear enemies
 * 
 * @param {number} score - Current player score
 * @returns {Object} Configuration object with spawnRate, speedMultiplier, and typeChances
 */
function getDifficultyConfig(score) {
  if (score < 5000) {
    // Stage 1: Beginner
    return {
      spawnRate: 1500,
      speedMultiplier: 0.5,
      allowedTypes: ['Linear'],
      typeChances: { Linear: 1.0, Homing: 0, Spinning: 0, HomingSpinning: 0 }
    }
  } else if (score < 10000) {
    // Stage 2: Intermediate
    return {
      spawnRate: 1200,
      speedMultiplier: 0.75,
      allowedTypes: ['Linear', 'Homing'],
      typeChances: { Linear: 0.6, Homing: 0.4, Spinning: 0, HomingSpinning: 0 }
    }
  } else if (score < 20000) {
    // Stage 3: Advanced
    return {
      spawnRate: 1000,
      speedMultiplier: 1.0,
      allowedTypes: ['Linear', 'Homing', 'Spinning'],
      typeChances: { Linear: 0.5, Homing: 0.3, Spinning: 0.2, HomingSpinning: 0 }
    }
  } else if (score < 50000) {
    // Stage 4: Expert
    return {
      spawnRate: 800,
      speedMultiplier: 1.2,
      allowedTypes: ['Linear', 'Homing', 'Spinning', 'HomingSpinning'],
      typeChances: { Linear: 0.4, Homing: 0.3, Spinning: 0.2, HomingSpinning: 0.1 }
    }
  } else {
    // Stage 5: Master
    return {
      spawnRate: 600,
      speedMultiplier: 1.5,
      allowedTypes: ['Linear', 'Homing', 'Spinning', 'HomingSpinning'],
      typeChances: { Linear: 0.3, Homing: 0.35, Spinning: 0.25, HomingSpinning: 0.1 }
    }
  }
}

function spawnEnemies() {
  const config = getDifficultyConfig(score)
  
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4
    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle) * config.speedMultiplier,
      y: Math.sin(angle) * config.speedMultiplier
    }

    enemies.push(new Enemy(x, y, radius, color, velocity, config.typeChances))
  }, config.spawnRate)
}

function spawnPowerUps() {
  spawnPowerUpsId = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: { x: -30, y: Math.random() * canvas.height },
        velocity: { x: Math.random() + 2, y: 0 }
      })
    )
  }, 10000)
}

function createScoreLabel({ position, score }) {
  const scoreLabel = document.createElement('label')
  scoreLabel.innerHTML = score
  scoreLabel.style.color = 'white'
  scoreLabel.style.position = 'absolute'
  scoreLabel.style.left = position.x + 'px'
  scoreLabel.style.top = position.y + 'px'
  scoreLabel.style.userSelect = 'none'
  scoreLabel.style.pointerEvents = 'none'
  document.body.appendChild(scoreLabel)

  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    }
  })
}

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.2)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  frames++

  backgroundParticles.forEach((backgroundParticle) => {
    backgroundParticle.draw(c)

    const dist = Math.hypot(
      player.x - backgroundParticle.position.x,
      player.y - backgroundParticle.position.y
    )

    if (dist < 100) {
      backgroundParticle.alpha = 0

      if (dist > 70) {
        backgroundParticle.alpha = 0.5
      }
    } else if (dist > 100 && backgroundParticle.alpha < 0.1) {
      backgroundParticle.alpha += 0.01
    } else if (dist > 100 && backgroundParticle.alpha > 0.1) {
      backgroundParticle.alpha -= 0.01
    }
  })

  player.update(c)
  updatePlayerMovement()

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i]

    if (powerUp.position.x > canvas.width) {
      powerUps.splice(i, 1)
    } else powerUp.update(c)

    const dist = Math.hypot(
      player.x - powerUp.position.x,
      player.y - powerUp.position.y
    )

    // gain power up
    if (dist < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(i, 1)
      player.powerUp = 'MachineGun'
      player.color = 'yellow'
      audio.powerUpNoise.play()

      // power up runs out
      setTimeout(() => {
        player.powerUp = null
        player.color = '#00ff00'
      }, 5000)
    }
  }

  // machine gun animation / implementation
  if (player.powerUp === 'MachineGun') {
    const velocity = {
      x: Math.cos(player.rotation) * 5,
      y: Math.sin(player.rotation) * 5
    }

    if (frames % 2 === 0) {
      const tip = player.getTipPosition()
      projectiles.push(
        new Projectile(tip.x, tip.y, 5, 'yellow', velocity)
      )
    }

    if (frames % 5 === 0) {
      audio.shoot.play()
    }
  }

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update(c)
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]

    projectile.update(c)

    // remove from edges of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update(c, player)

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    // end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      clearInterval(intervalId)
      clearInterval(spawnPowerUpsId)
      audio.death.play()
      game.active = false

      modalEl.style.display = 'block'
      gsap.fromTo(
        '#modalEl',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'expo'
        }
      )
      modalScoreEl.innerHTML = score

      // update high score
      const highScore = parseInt(localStorage.getItem('highScore'))

      if (score > highScore) {
        localStorage.setItem('highScore', score)
        highScoreEl.innerHTML = score
      }
    }

    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex]

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }
        // this is where we shrink our enemy
        if (enemy.radius - 10 > 5) {
          audio.damageTaken.play()
          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y
            },
            score: 100
          })
          projectiles.splice(projectilesIndex, 1)
        } else {
          // remove enemy if they are too small
          audio.explode.play()
          score += 150
          scoreEl.innerHTML = score
          createScoreLabel({
            position: {
              x: projectile.x,
              y: projectile.y
            },
            score: 150
          })

          // change background particle colors
          backgroundParticles.forEach((backgroundParticle) => {
            gsap.set(backgroundParticle, {
              color: 'white',
              alpha: 1
            })
            gsap.to(backgroundParticle, {
              color: enemy.color,
              alpha: 0.1
            })
            // backgroundParticle.color = enemy.color
          })

          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
}

let audioInitialized = false

function shoot() {
  if (game.active) {
    const tip = player.getTipPosition()
    const velocity = {
      x: Math.cos(player.rotation) * 5,
      y: Math.sin(player.rotation) * 5
    }
    projectiles.push(new Projectile(tip.x, tip.y, 5, 'white', velocity))

    audio.shoot.play()
  }
}

window.addEventListener('click', (event) => {
  if (!audio.background.playing() && !audioInitialized) {
    audio.background.play()
    audioInitialized = true
  }
})

window.addEventListener('touchstart', (event) => {
  if (!audio.background.playing() && !audioInitialized) {
    audio.background.play()
    audioInitialized = true
  }

  if (game.active) {
    shoot()
  }
})

// restart game
buttonEl.addEventListener('click', () => {
  audio.select.play()
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('#modalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none'
    }
  })
})

startButtonEl.addEventListener('click', () => {
  audio.select.play()
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  // startModalEl.style.display = 'none'
  gsap.to('#startModalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      startModalEl.style.display = 'none'
    }
  })
})

// mute everything
volumeUpEl.addEventListener('click', () => {
  audio.background.pause()
  volumeOffEl.style.display = 'block'
  volumeUpEl.style.display = 'none'

  for (let key in audio) {
    audio[key].mute(true)
  }
})

// unmute everything
volumeOffEl.addEventListener('click', () => {
  if (audioInitialized) audio.background.play()
  volumeOffEl.style.display = 'none'
  volumeUpEl.style.display = 'block'
  for (let key in audio) {
    audio[key].mute(false)
  }
})

window.addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight

  init()
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // inactive
    // clearIntervals
    clearInterval(intervalId)
    clearInterval(spawnPowerUpsId)
  } else {
    // spawnEnemies spawnPowerUps
    spawnEnemies()
    spawnPowerUps()
  }
})

// window.addEventListener('keydown', (event) => {
//   switch (event.key) {
//     case 'ArrowRight':
//       player.velocity.x += 1
//       break
//     case 'ArrowUp':
//       player.velocity.y -= 1
//       break
//     case 'ArrowLeft':
//       player.velocity.x -= 1
//       break
//     case 'ArrowDown':
//       player.velocity.y += 1
//       break
//   }
// })

const keysPressed = {} // Object to track keys being pressed

// Listen for keydown events and mark keys as pressed
window.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true

  // Spacebar to shoot
  if (event.key === ' ' && game.active) {
    shoot()
  }
})

// Listen for keyup events and mark keys as not pressed
window.addEventListener('keyup', (event) => {
  delete keysPressed[event.key]
})

// Update player movement based on the keys pressed
function updatePlayerMovement() {
  const rotationSpeed = 0.08
  const thrust = 0.15
  const brake = 0.96

  // Rotation
  if (keysPressed['ArrowLeft']) {
    player.rotation -= rotationSpeed
  }
  if (keysPressed['ArrowRight']) {
    player.rotation += rotationSpeed
  }

  // Thrust - accelerate in direction of rotation
  if (keysPressed['ArrowUp']) {
    player.velocity.x += Math.cos(player.rotation) * thrust
    player.velocity.y += Math.sin(player.rotation) * thrust
  }

  // Brake - slow down
  if (keysPressed['ArrowDown']) {
    player.velocity.x *= brake
    player.velocity.y *= brake
  }
}

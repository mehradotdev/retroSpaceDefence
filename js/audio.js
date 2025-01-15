const VOL_LVL = 0.5

export const audio = {
  shoot: new Howl({
    src: './audio/Basic_shoot_noise.wav',
    volume: VOL_LVL
  }),
  damageTaken: new Howl({
    src: './audio/Damage_taken.wav',
    volume: VOL_LVL
  }),
  explode: new Howl({
    src: './audio/Explode.wav',
    volume: VOL_LVL
  }),
  death: new Howl({
    src: './audio/Death.wav',
    volume: VOL_LVL
  }),
  powerUpNoise: new Howl({
    src: './audio/Powerup_noise.wav',
    volume: VOL_LVL
  }),
  select: new Howl({
    src: './audio/Select.wav',
    volume: VOL_LVL,
    html5: true
  }),
  background: new Howl({
    src: './audio/Hyper.wav',
    volume: VOL_LVL,
    loop: true
  })
}
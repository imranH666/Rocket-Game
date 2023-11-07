const scoreElement = document.querySelector('.score')
const audio = document.querySelector(".music")
const canvas = document.querySelector(".canvas")
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0,
        }
        this.color = "red"
        this.opacity = 1
        this.hitCount = 1
        
        const image = new Image()
        image.src = "./images/misile.png"

        image.onload = () => {
            this.image = image
            this.width = image.width * 0.2
            this.height = image.height * 0.2
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20,
            }
        }
    }
    draw() {
        // ctx.fillStyle = this.color
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.translate(this.position.x + 25, this.position.y); 
        ctx.rotate(0.4);
        ctx.drawImage(this.image, 0, 0, this.width, this.height)
        ctx.restore()
    }
    update() {
        if(this.image){
            this.draw()
        this.position.x += this.velocity.x
        }
    }
}

class Invader {
    constructor({position}) {
        this.velocity = {
            x: 0,
            y: 2,
        }
        const image = new Image()
        image.src = './images/misile.png'
        image.onload = () => {
            this.image = image
            const invaderSize = 0.3
            this.width = image.width * invaderSize
            this.height = image.height * invaderSize
            this.position = {
                x: position.x,
                y: position.y,
            }
        }
    }
    draw() {
        // ctx.fillStyle = 'red'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.save()
        ctx.translate(this.position.x + 40, this.position.y + 140)
        ctx.rotate(-2.8)
        ctx.drawImage(this.image, 0, 0, this.width, this.height)
        ctx.restore()
    }
    update() {
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
    }
    shoot(invaderProjectile) {
        invaderProjectile.push(new InvaderProjectile({
            position: {x: this.position.x + this.width / 2, y: this.position.y + this.height},
            velocity: {x: 0, y: 5}
        }))
    }
}

class Projectile {
    constructor(position, velocity) {
        this.position = position
        this.velocity = velocity
        this.opacity = 1
        this.radius = 5
    }
    draw() {
        ctx.beginPath()
        ctx.globalAlpha = this.opacity
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = '#f1b40b'
        ctx.fill()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class InvaderProjectile {
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        this.width = 10
        this.height = 15
    }
    draw() {
        ctx.fillStyle = "red"
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle{
    constructor({position, velocity, radius, color, fades}) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.fades = fades
        this.opacity = 1
    }
    draw(){
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.fades) {
            this.opacity -=0.01
        }
    }
}

class BackgroundParticle {
    constructor({position, velocity, radius, color, fades, planetNumber}) {
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.fades = fades
        this.opacity = 1
        let planets = ['./images/meteor.png', './images/planet4.png']
        const image = new Image()
        image.src = planets[planetNumber]
        image.onload = () => {
            this.image = image
            this.width = image.width * (Math.random() * 0.09)
            this.height = image.height * (Math.random() * 0.09)
            this.position = {
                x: position.x,
                y: position.y,
            }
        }
    }
    draw() {
        // ctx.fillStyle = 'red'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
        ctx.closePath()
        ctx.restore()
    }
    update() {
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y

            if(this.fades) {
                this.opacity -=0.01
            }
        }
        
    }
}

const player = new Player()
let projectiles = []
let invaders = []
let particles = []
let backgroundParticles = []
let invaderProjectiles = []
let score = 0
let keys = {
    a: false,
    d: false,
    space: false,
}
let frames = 0
let gameOver = true


for(let i = 0; i < 25; i++) {
    backgroundParticles.push(new BackgroundParticle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        },
        velocity: {
            x: 0,
            y: 0.5,
        },
        // radius: Math.random() * 5,
        color: "#f1b40b",
        fades: false,
        planetNumber: Math.ceil(Math.random() * 2 - 1),
    }))
}


function animate() {
    if(!gameOver) return
    requestAnimationFrame(animate)
    ctx.fillStyle = "#222"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    player.update()

    invaderProjectiles.forEach((invaderProjectile, invaderProjectileIndex) => {
        if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height){
            invaderProjectiles.splice(invaderProjectileIndex, 1)
        }else {
            invaderProjectile.update()
        }

        if(invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
            invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width) {
                if(player.hitCount >= 5) {
                    player.opacity = 0
                    setTimeout(() => {
                        gameOver = false
                    }, 1000)
                }else {
                    player.hitCount++
                }

                invaderProjectiles.splice(invaderProjectileIndex, 1)

                for(let i = 0; i < 25; i++) {
                    particles.push(new Particle({
                        position: {
                            x: player.position.x + player.width / 2,
                            y: player.position.y,
                        },
                        velocity: {
                            x: (Math.random() - 0.5) * 3,
                            y: (Math.random() - 0.5) * 3,
                        },
                        radius: Math.random() * 7,
                        color: `red`,
                        fades: true
                    }))
                }
        }
    })

    backgroundParticles.forEach((backgroundParticle) => {
        if(backgroundParticle.position.y - backgroundParticle.height >= canvas.height) {
            backgroundParticle.position.x = Math.random() * canvas.width
            backgroundParticle.position.y = -backgroundParticle.width
        }

        backgroundParticle.update()
    })

    particles.forEach((particle, particleIndex) => {
        if(particle.position.y - particle.radius >= canvas.height) {
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius
        }

        if(particle.opacity <= 0){
            particles.splice(particleIndex, 1)
        }else  {
            particle.update()
        }
    })

    invaders.forEach((invader, invaderIndex) => {
        if(invader.position.y - invader.height >= canvas.height){
            setTimeout(() => {
                invaders.splice(invaderIndex, 1)
            }, 0)
        }else {
            invader.update()
            if(frames % 200 === 0 || invader.position.y === -100) {
                invader.shoot(invaderProjectiles)
            }
        }
        
    })

    projectiles.forEach((projectile, projectileIndex) => {
        if(projectile.position.y + projectile.radius <= 0) {
            projectiles.splice(projectileIndex, 1)
        }else {
            projectile.update()
        }
        // invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
        //     invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
        //     invaderProjectile.position.x <= player.position.x + player.width

        invaders.forEach((invader, invaderIndex) => {
            if(projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                projectile.position.x + projectile.radius >= invader.position.x &&
                projectile.position.y + projectile.radius >= invader.position.y) {

                    score += 10
                    scoreElement.textContent = score

                    for(let i = 0; i < 25; i++) {
                        particles.push(new Particle({
                            position: {
                                x: invader.position.x + invader.width / 2,
                                y: invader.position.y + invader.height / 2,
                            },
                            velocity: {
                                x: (Math.random() - 0.5) * 3,
                                y: (Math.random() - 0.5) * 3,
                            },
                            radius: Math.random() * 7,
                            color: `gray`,
                            fades: true
                        }))
                    }

                    invaders.splice(invaderIndex, 1)
                    projectiles.splice(projectileIndex, 1)
                }
        })
    })

    if(keys.a && player.position.x > 0) {
        player.velocity.x = -5
    }else if (keys.d && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5
    }else {
        player.velocity.x = 0
        
    }
    
    if(score >= 0 && score <= 100){
        if(frames % 200 === 0) {
            const invaderX = Math.random() * (canvas.width - 50)
            invaders.push(new Invader({position: {x: invaderX, y: -150}}))
        }
    }else if(score >= 101 && score <= 200) {
        if(frames % 50 === 0) {
            const invaderX = Math.random() * (canvas.width - 50)
            invaders.push(new Invader({position: {x: invaderX, y: -150}}))
        }
    }else {
        if(frames % 30 === 0) {
            const invaderX = Math.random() * (canvas.width - 50)
            invaders.push(new Invader({position: {x: invaderX, y: -150}}))
        }
    }
    frames++
}

setInterval(() => {
    const position = {
        x: player.position.x + player.width / 2,
        y: player.position.y
    }
    const velocity = {
        x: 0,
        y: -5
    }
    projectiles.push(new Projectile(position, velocity))
}, 300)


window.addEventListener("keydown", ({key}) => {
    audio.play()
    switch (key) {
        case 'a':
            keys.a = true
            break
        case 'd':
            keys.d = true
            break
        case 's':
            
            break
    }
})
window.addEventListener("keyup", ({key}) => {
    switch (key) {
        case 'a':
            keys.a = false
            break
        case 'd':
            keys.d = false
            break
        case 's':
            break
    }
})

animate()



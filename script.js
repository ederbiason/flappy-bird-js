function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

function PairOfBarriers(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.higher = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.bottom.element)

    this.drawOpening = () => {
        const heightHigher = Math.random() * (height - opening)
        const heightBottom = height - opening - heightHigher
        this.higher.setHeight(heightHigher) 
        this.bottom.setHeight(heightBottom) 
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
}

function Barriers(height, width, opening, space, notifyPoint) {
    this.pairs = [
        new PairOfBarriers(height, opening, width),
        new PairOfBarriers(height, opening, width + space),
        new PairOfBarriers(height, opening, width + space * 2),
        new PairOfBarriers(height, opening, width + space * 3)
    ]

    const displacement = 3
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement)

            // when the element leaves of the screen game
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + space * this.pairs.length)
                pair.drawOpening()
            }

            const mid = width / 2
            const crossMid = pair.getX() + displacement >= mid 
                && pair.getX() < mid

            if (crossMid) {
                notifyPoint()
            }
        })
    }
}

function Bird(gameHeight) {
    let fly = false

    this.element = newElement('img', 'bird')
    this.element.src = 'assets/img/bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    // When the user click any key and stay press, fly = true
    window.onkeydown = e => fly = true 
    // When the user releases the key
    window.onkeyup = e => fly = false

    this.animation = () => {
        const newY = this.getY() + (fly ? 8 : -5)
        const maxHeight = gameHeight - this.element.clientHeight

        if(newY <= 0) {
            this.setY(0)
        } else if (newY >= maxHeight) {
            this.setY(maxHeight)
        } else {
            this.setY(newY)
        }
    }

    this.setY(gameHeight / 2)
} 

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

function overlapped(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

function collided(bird, barriers) {
    let collided = false
    barriers.pair.forEach(pairOfBarriers => {
        if (!collided) {
            const higher = pairOfBarriers.higher.element
            const bottom = pairOfBarriers.bottom.element
            collided = overlapped(bird.element, higher) 
                || overlapped(bird.element, bottom) 
        }
    })
    return collided
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const barriers = new Barriers(height, width, 200, 400, () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.element))

    this.start = () => {
        // Loop of the game
        const timer = setInterval(() => {
            barriers.animation()
            bird.animation()

            if(collided(bird, barriers)) {
                clearInterval(timer)
            }
        }, 20);
    }
}

new FlappyBird().start()
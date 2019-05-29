import './styles/index.css';

window.addEventListener('load', () => {
	const el = document.querySelector('.hero');
	const container = document.querySelector('.game-container');
	new Doodle(el, container);
})

Math.randInt = function(min, max) {
	return Math.floor(min + Math.random() * (max + 1 - min));	
}

class Doodle {
	constructor(el, container) {
		this.el = el;
		this.container = container;
		this.isJumping = false;
		this.jumpSize = 150;
		this.floor = 80;
		this.plateHeight = 0;
		this.plates = [];
		this.jumpDuration = 1000;
		this.moveDuration = 600;
		this.moveSize = 100;
		this.el.style.bottom = '10%';
		this.el.style.left = '50%';
		this.moveBg = false;
		this.container.style.backgroundPositionY = '67%';
		this.moveUp();
		console.log(this.pseudoRandom(5, 0, 100, 10));
		window.addEventListener('keydown', (e) => {
			switch (e.key) {
				case 'ArrowLeft':
					this.moveLeft();
					break;
				case 'ArrowRight':
					this.moveRight();
					break;
			}
		})

		window.addEventListener('keyup', (e) => {
			switch (e.key) {
				case 'ArrowLeft':
					this.isMovingLeft = false;
					break;
				case 'ArrowRight':
					this.isMoveingRight = false;
					break;
			}
		})
	}


	timingFunctionUp = (t) => {
		return t <= 1 ? t*(2-t) : 1; 
	}


	timingFunctionDown = (t) => {
		return t <= 1 ? t*t : 1;
	}


	moveUp = () => {
		if (this.isJumping) {
			return;
		}
		this.isJumping = true;
		this.isFalling = false;
		this.containerHeight = this.container.getBoundingClientRect().height;
		this.startElPos = parseInt(this.el.style.bottom);
		this.startBgPos = parseInt(this.container.style.backgroundPositionY);
		this.plateConstructor(this.startBgPos);
		this.startTime = performance.now();
		requestAnimationFrame(this.animateUp);
	}

	animateUp = () => {
		let time = (performance.now() - this.startTime) / this.jumpDuration;

		if (time > 1) {
			time = 1;
		}
		
		let delta = this.timingFunctionUp(time) * this.jumpSize;
		if (this.moveBg) {
			let value = this.startBgPos + delta - this.bgDelta;
			let plateDelta = value - parseInt(this.container.style.backgroundPositionY);
			let i = 0;
			while (i < this.plates.length) {
				const item = this.plates[i];
				item.style.top = parseInt(item.style.top) + plateDelta + '%';
				if (parseInt(item.style.top) > 100) {
					this.plates.splice(i, 1);
					item.remove();
				} else {
					i++;
				}
			}
			this.plateConstructor(value);
			this.container.style.backgroundPositionY = value + '%';
		} else {
			let value;
			if (this.startElPos + delta > this.floor) {
				value = this.floor;
			} else {
				value = this.startElPos + delta;
			}

			this.el.style.bottom = value + '%';
			if (value === this.floor) {
				this.moveBg = true;
				this.bgDelta = delta;
			}
		}

		if (time < 1) {
			requestAnimationFrame(this.animateUp);
		} else {
			this.moveBg = false;
			this.moveDown();
		}
	}


	moveDown = () => {
		if (this.isFalling) {
			return;
		}
		this.isFalling = true;
		this.isJumping = false;
		this.startElPos = parseInt(this.el.style.bottom);
		this.startTime = performance.now();
		requestAnimationFrame(this.animateDown);
	}


	animateDown = () => {
		let time = (performance.now() - this.startTime) / this.jumpDuration;

		if (time > 1) {
			time = 1;
		}

		let delta = this.timingFunctionDown(time) * this.jumpSize;
		this.el.style.bottom = (this.startElPos - delta) + '%';
		this.checkTouch();
		if (this.isFalling) {
			requestAnimationFrame(this.animateDown);
		}
	}


	moveLeft = () => {
		if (this.isMovingLeft || this.isMoveingRight) {
			return;
		}
		this.isMovingLeft = true;

		this.keyDownPos = parseInt(this.el.style.left);
		this.keyDownTime = performance.now();
		requestAnimationFrame(this.animateLeft);
	}


	animateLeft = () => {
		if (!this.isMovingLeft) {
			return;
		}
		let time = (performance.now() - this.keyDownTime) / this.moveDuration;
		
		let delta = time * this.moveSize;
		let value = this.keyDownPos - delta;
		if (value < 0) {
			value = 0;
		}
		this.el.style.left = value + '%';
		requestAnimationFrame(this.animateLeft)
	}


	moveRight = () => {
		if (this.isMoveingRight || this.isMovingLeft) {
			return;
		}
		this.isMoveingRight = true;

		this.keyDownPos = parseInt(this.el.style.left);
		this.keyDownTime = performance.now();
		requestAnimationFrame(this.animateRight);
	}


	animateRight = () => {
		if (!this.isMoveingRight) {
			return;
		}
		let time = (performance.now() - this.keyDownTime) / this.moveDuration;
		
		let delta = time * this.moveSize;
		let value = this.keyDownPos + delta;
		if (value > 100) {
			value = 100;
		}
		this.el.style.left = value + '%';
		requestAnimationFrame(this.animateRight)
	}


	plateConstructor = (height) => {
		if (this.plateHeight * 100 > height) {
			return;
		}
		console.log('create');
		this.plateHeight += 1;
		const randomLeft = this.pseudoRandom(4, 0, 100, 10);
		const randomTop = this.pseudoRandom(4, 0, 100, 10);
		for (let i = 0; i < 4; i++) {
			const plate = this.createPlate();
			plate.style.left = randomLeft[i] + '%';
			plate.style.top = -100 + randomTop[i] + '%';
			this.plates.push(plate);
			this.container.append(plate);
		}

	}

	createPlate = () => {
		const plate = document.createElement('div');
		plate.classList.add('plate');
		const plateWrapper = document.createElement('div');
		plateWrapper.classList.add('plate__wrapper');
		plate.append(plateWrapper);
		return plate;
	}

	pseudoRandom = (n, min, max, determinant) => {
		const variables = [];
		const delta = (max - min) / determinant;
		for (let i = min; i < max; i += determinant) {
			variables.push(i);
		}
		const res = [];
		
		for (let i = 0; i < n; i++) {
			
			let x = Math.randInt(0, variables.length - 1);
			let value = variables[x];
			variables.splice(x, 1);
			value += Math.randInt(0, delta);
			res.push(value);
		}
		return res;
	}

	checkTouch = () => {
		const heroRect = this.el.getBoundingClientRect();
		this.plates.forEach((item) => {
			const plateRect = item.getBoundingClientRect();
			if (heroRect.left - plateRect.left < plateRect.width && plateRect.left - heroRect.left < heroRect.width) {
				if (plateRect.top - heroRect.top < heroRect.height && plateRect.top - heroRect.top > heroRect.height - plateRect.height) {
					this.moveUp();
				}
			}
		})
	}
}
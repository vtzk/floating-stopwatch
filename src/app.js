const { ipcRenderer } = require('electron');

const withLeadingZero = (num) => (num < 10 ? `0${num}` : num);

const milisecondsWithLeadingZero = (miliseconds) => {
  if (miliseconds < 10) {
    return `00${miliseconds}`;
  }
  return miliseconds < 100 ? `0${miliseconds}` : miliseconds;
};
class Timer {
  constructor() {
    this.elapsedTime = 0;
    this.timer = null;
    this.interval = 100;
    this.callbacks = [];
  }

  start() {
    let checkpoint = Date.now();
    this.timer = setInterval(() => {
      this.elapsedTime += Date.now() - checkpoint;
      checkpoint = Date.now();
      this.callbacks.forEach((callback) =>
        callback(this.formatMilisecondsElapsed())
      );
    }, this.interval);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  reset() {
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.callbacks.forEach((callback) =>
      callback(this.formatMilisecondsElapsed())
    );
  }

  toggle() {
    if (this.timer) {
      this.stop();
    } else {
      this.start();
    }
  }

  formatMilisecondsElapsed() {
    const miliseconds = this.elapsedTime % 1000;
    const seconds = Math.floor(this.elapsedTime / 1000) % 60;
    const minutes = Math.floor(this.elapsedTime / 60000) % 60;
    const hours = Math.floor(this.elapsedTime / 3600000);
    const stringsArray = [hours, minutes, seconds].map(withLeadingZero);
    stringsArray.push(milisecondsWithLeadingZero(miliseconds));
    return stringsArray.join(':');
  }

  onTick(callback) {
    this.callbacks.push(callback);
  }
}

const toggleButton = () => {
  const circle = document.getElementById('circle');
  const pauseToPlay = document.getElementById('from_pause_to_play');
  const playToPause = document.getElementById('from_play_to_pause');
  let state = circle.classList.contains('play') ? 'playing' : 'paused';

  if (state === 'paused') {
    state = 'playing';
    circle.classList.add('play');
    pauseToPlay.beginElement();
  } else {
    state = 'paused';
    circle.classList.remove('play');
    playToPause.beginElement();
  }
};

const pageLoaded = () => {
  const playButton = document.querySelector('.play');
  const timer = new Timer();

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyX' && e.metaKey) {
      timer.reset();
    }
    if (e.code === 'Space') {
      playButton.click();
    }
  });
  timer.onTick((time) => {
    document.getElementById('time-elapsed').innerHTML = time;
  });

  playButton.addEventListener('click', () => {
    toggleButton();
    timer.toggle();
  });

  toggleButton();

  window.addEventListener('blur', () => {
    document.body.classList.remove('focused');
    ipcRenderer.send('windowFocusEvent', false);
  });

  window.addEventListener('focus', () => {
    document.body.classList.add('focused');
    ipcRenderer.send('windowFocusEvent', true);
  });
};

document.addEventListener('DOMContentLoaded', pageLoaded);

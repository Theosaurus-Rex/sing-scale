class VocalWarmupApp {
  constructor() {
    // Audio Context
    this.audioContext = null;
    this.isPlaying = false;
    this.currentNote = 0;
    this.noteQueue = [];
    this.baseFrequency = 261.63; // Middle C
    this.transpose = 0;

    // Scale patterns
    this.scales = {
      major: [0, 2, 4, 5, 7, 9, 11, 12], // Semitones from root
      minor: [0, 2, 3, 5, 7, 8, 10, 12],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    };

    // UI Elements
    this.scaleSelect = document.getElementById("scaleSelect");
    this.patternSelect = document.getElementById("patternSelect");
    this.transposeUpBtn = document.getElementById("transposeUp");
    this.transposeDownBtn = document.getElementById("transposeDown");
    this.playPauseBtn = document.getElementById("playPause");

    // Add root note frequencies (in Hz)
    this.rootNotes = {
      C: 261.63,
      "C#": 277.18,
      D: 293.66,
      "D#": 311.13,
      E: 329.63,
      F: 349.23,
      "F#": 369.99,
      G: 392.0,
      "G#": 415.3,
      A: 440.0,
      "A#": 466.16,
      B: 493.88,
    };

    // Add root note select element
    this.rootNoteSelect = document.getElementById("rootNoteSelect");

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    this.transposeUpBtn.addEventListener("click", () => this.transposeScale(1));
    this.transposeDownBtn.addEventListener("click", () =>
      this.transposeScale(-1)
    );
    this.scaleSelect.addEventListener("change", () => this.updateNoteQueue());
    this.patternSelect.addEventListener("change", () => this.updateNoteQueue());
    this.rootNoteSelect.addEventListener("change", () => this.updateRootNote());
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
  }

  generateNoteQueue() {
    const selectedScale = this.scales[this.scaleSelect.value];
    const pattern = this.patternSelect.value;
    let queue = [];

    switch (pattern) {
      case "ascending":
        queue = [...selectedScale];
        break;
      case "descending":
        queue = [...selectedScale].reverse();
        break;
      case "ascendingDescending":
        queue = [...selectedScale, ...selectedScale.slice(0, -1).reverse()];
        break;
      case "broken":
        const root = selectedScale[0];
        for (let i = 1; i < selectedScale.length; i++) {
          queue.push(root, selectedScale[i]);
        }
        break;
    }

    return queue;
  }

  updateNoteQueue() {
    this.noteQueue = this.generateNoteQueue();
    if (this.isPlaying) {
      this.stopPlaying();
      this.startPlaying();
    }
  }

  playNote(semitones) {
    this.initAudioContext();
    const frequency = this.baseFrequency * Math.pow(2, semitones / 12);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  startPlaying() {
    this.isPlaying = true;
    this.playPauseBtn.textContent = "Pause";
    this.playSequence();
  }

  stopPlaying() {
    this.isPlaying = false;
    this.playPauseBtn.textContent = "Play";
    this.currentNote = 0;
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.stopPlaying();
    } else {
      this.startPlaying();
    }
  }

  playSequence() {
    if (!this.isPlaying) return;

    this.playNote(this.noteQueue[this.currentNote]);

    this.currentNote = (this.currentNote + 1) % this.noteQueue.length;

    setTimeout(() => {
      if (this.isPlaying) {
        this.playSequence();
      }
    }, 600); // Adjust timing between notes here
  }

  transposeScale(semitones) {
    this.transpose += semitones;
    // Optional: Update display to show current transpose level
  }

  updateRootNote() {
    this.baseFrequency = this.rootNotes[this.rootNoteSelect.value];
    if (this.isPlaying) {
      this.stopPlaying();
      this.startPlaying();
    }
  }
}

// Initialize the app when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  const app = new VocalWarmupApp();
});

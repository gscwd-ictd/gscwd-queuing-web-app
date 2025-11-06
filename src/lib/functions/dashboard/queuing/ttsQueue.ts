class TTSQueue {
  private queue: SpeechSynthesisUtterance[] = [];
  private isSpeaking = false;

  addToQueue(
    text: string,
    volume: number = 1,
    rate: number = 0.75,
    pitch: number = 1
  ) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;

    this.queue.push(utterance);

    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.queue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    this.isSpeaking = true;
    const utterance = this.queue.shift()!;

    utterance.onend = () => {
      this.processQueue();
    };

    utterance.onerror = () => {
      this.processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }

  clearQueue() {
    this.queue = [];
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
  }

  getQueueLength() {
    return this.queue.length;
  }

  isCurrentlySpeaking() {
    return this.isSpeaking;
  }
}

export const ttsQueue = new TTSQueue();

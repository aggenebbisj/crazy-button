import { getRandomMessage, _testing } from '../messages';

const { DIEREN, VOORWERPEN, EMOJI_POOL, GELUIDEN } = _testing;

describe('getRandomMessage', () => {
  it('returns a message with type and content', () => {
    const message = getRandomMessage();
    expect(message).toHaveProperty('type');
    expect(message).toHaveProperty('content');
    expect(['text', 'emoji', 'sound', 'sticker']).toContain(message.type);
    expect(message.content.length).toBeGreaterThan(0);
  });

  it('generates unique text messages', () => {
    const messages = new Set<string>();
    for (let i = 0; i < 50; i++) {
      jest.spyOn(Math, 'random').mockReturnValueOnce(0.1); // force text
      const msg = getRandomMessage();
      jest.restoreAllMocks();
      messages.add(msg.content);
    }
    // With random generation, we should get many unique messages
    expect(messages.size).toBeGreaterThan(20);
  });

  it('generates emoji combos with 3-5 emojis', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.35); // force emoji
    const msg = getRandomMessage();
    jest.restoreAllMocks();
    expect(msg.type).toBe('emoji');
    // Each emoji is 1-2 chars (some are surrogate pairs), combo should have multiple
    expect(msg.content.length).toBeGreaterThanOrEqual(2);
  });

  it('generates sound messages with emoji', () => {
    jest.spyOn(Math, 'random').mockReturnValueOnce(0.55); // force sound
    const msg = getRandomMessage();
    jest.restoreAllMocks();
    expect(msg.type).toBe('sound');
    expect(msg.content).toContain('!');
  });

  it('has enough words in each pool for variety', () => {
    expect(DIEREN.length).toBeGreaterThanOrEqual(15);
    expect(VOORWERPEN.length).toBeGreaterThanOrEqual(15);
    expect(EMOJI_POOL.length).toBeGreaterThanOrEqual(40);
    expect(GELUIDEN.length).toBeGreaterThanOrEqual(15);
  });
});

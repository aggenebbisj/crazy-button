import { getRandomMessage, getRandomMessageAsync, FUNNY_TEXTS, EMOJI_COMBOS, SOUND_MESSAGES, STICKERS, BIG_STICKERS } from '../messages';

describe('getRandomMessage', () => {
  it('returns a message with type and content', () => {
    const message = getRandomMessage();
    expect(message).toHaveProperty('type');
    expect(message).toHaveProperty('content');
    expect(['text', 'emoji', 'sound', 'sticker']).toContain(message.type);
    expect(message.content.length).toBeGreaterThan(0);
  });

  it('returns text messages when roll < 0.3', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0);
    const message = getRandomMessage();
    expect(message.type).toBe('text');
    expect(FUNNY_TEXTS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns emoji messages when roll 0.3-0.5', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.35)
      .mockReturnValueOnce(0);
    const message = getRandomMessage();
    expect(message.type).toBe('emoji');
    expect(EMOJI_COMBOS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns sound messages when roll 0.5-0.7', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.55)
      .mockReturnValueOnce(0);
    const message = getRandomMessage();
    expect(message.type).toBe('sound');
    expect(SOUND_MESSAGES).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns sticker messages when roll 0.7-0.85', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.75)
      .mockReturnValueOnce(0);
    const message = getRandomMessage();
    expect(message.type).toBe('sticker');
    expect(STICKERS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('returns big sticker messages when roll >= 0.85', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0.9)
      .mockReturnValueOnce(0);
    const message = getRandomMessage();
    expect(message.type).toBe('sticker');
    expect(BIG_STICKERS).toContain(message.content);
    jest.restoreAllMocks();
  });

  it('has enough messages per category', () => {
    expect(FUNNY_TEXTS.length).toBeGreaterThanOrEqual(10);
    expect(EMOJI_COMBOS.length).toBeGreaterThanOrEqual(10);
    expect(SOUND_MESSAGES.length).toBeGreaterThanOrEqual(5);
    expect(STICKERS.length).toBeGreaterThanOrEqual(10);
    expect(BIG_STICKERS.length).toBeGreaterThanOrEqual(5);
  });
});

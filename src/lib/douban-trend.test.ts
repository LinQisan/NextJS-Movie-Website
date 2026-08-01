import { describe, expect, it } from 'vitest';

import {
  createDoubanRatingSnapshot,
  normalizeDoubanText,
  parseDoubanWebSearch,
  parseDoubanRating,
  selectDoubanSuggestion,
  type DoubanSuggestion,
} from './douban-trend';

describe('douban rating helpers', () => {
  it('normalizes punctuation and full-width text for matching', () => {
    expect(normalizeDoubanText('The　Matrix：')).toBe('thematrix');
  });

  it('prefers an exact title and matching year', () => {
    const suggestions: DoubanSuggestion[] = [
      { id: '1', title: '同名作品', year: '2001' },
      { id: '2', title: '同名作品', year: '2021' },
    ];

    expect(
      selectDoubanSuggestion(suggestions, {
        title: '同名作品',
        year: '2021',
        media: 'movie',
      })?.id,
    ).toBe('2');
  });

  it('matches a title supplied by another locale', () => {
    const suggestion: DoubanSuggestion = {
      id: '3',
      title: '霸王别姬',
      year: '1993',
    };

    expect(
      selectDoubanSuggestion([suggestion], {
        title: 'Farewell My Concubine',
        titles: ['霸王别姬'],
        year: '1993',
        media: 'movie',
      })?.id,
    ).toBe('3');
  });

  it('parses the public Douban web search fallback', () => {
    const suggestions = parseDoubanWebSearch(`
      <div class="result">
        <a class="nbg" href="https://www.douban.com/link2/?url=https%3A%2F%2Fmovie.douban.com%2Fsubject%2F1291843%2F" title="The Matrix"></a>
        <div class="title"><a href="https://movie.douban.com/subject/1291843/">黑客帝国</a></div>
        <span class="rating_nums">9.1</span>
        <span>(123,456人评价)</span>
        <span class="subject-cast">原名:The Matrix / 导演 / 1999</span>
      </div>
    `);

    expect(suggestions[0]).toMatchObject({
      id: '1291843',
      title: 'The Matrix',
      subtitle: '黑客帝国',
      year: '1999',
      score: 9.1,
      votes: 123456,
    });
  });

  it('uses the latest valid zduo score without retaining history', () => {
    const suggestion: DoubanSuggestion = {
      id: '1291546',
      title: '霸王别姬',
      year: '1993',
      votes: 500000,
    };
    const rating = parseDoubanRating(
      {
        code: '1',
        data: {
          day_rate: {
            series: [{ data: ['9.5', '0', '9.6'] }],
          },
        },
      },
      suggestion,
    );

    expect(rating).toMatchObject({ score: 9.6, votes: 500000 });
    expect(rating).not.toHaveProperty('rate');
  });

  it('creates a score-only snapshot when history is unavailable', () => {
    const snapshot = createDoubanRatingSnapshot({
      id: '3016187',
      title: '权力的游戏 第一季',
      score: 9.5,
      votes: 502511,
    });

    expect(snapshot).toMatchObject({ score: 9.5, votes: 502511 });
    expect(snapshot).not.toHaveProperty('rate');
  });
});

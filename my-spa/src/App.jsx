import React from 'react';
import './App.css';

// Моковые данные для таблицы (взяты из скриншота)
const lots = [
  { id: 1, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 22ч' },
  { id: 2, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 22ч' },
  { id: 3, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 21ч' },
  { id: 4, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 22ч' },
  { id: 5, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 22ч' },
  { id: 6, bestPrice: true, quantity: 1, bid: null, buyout: 300000, perPiece: 300000, rank: '+28%', rankColor: 'green', time: '1д 22ч' },
  { id: 7, bestPrice: false, quantity: 1, bid: 320000, buyout: 345000, perPiece: 345000, rank: '+47%', rankColor: 'red', time: '1д 19ч' },
  { id: 8, bestPrice: false, quantity: 1, bid: null, buyout: 349999, perPiece: 349999, rank: '+49%', rankColor: 'red', time: '17:39:50' },
  { id: 9, bestPrice: false, quantity: 1, bid: null, buyout: 350000, perPiece: 350000, rank: '+49%', rankColor: 'red', time: '1д 16ч' },
  { id: 10, bestPrice: false, quantity: 1, bid: null, buyout: 350000, perPiece: 350000, rank: '+49%', rankColor: 'red', time: '1д 16ч' },
];

function App() {
  return (
    <div className="layout">
      {/* Верхняя навигация */}
      <header className="top-nav">
        <div className="breadcrumbs">Инструменты / Аукцион / Другое / «Жестянка» / Лоты</div>
        <div className="main-menu">
          <span>Каталог</span>
          <span>Мониторинг</span>
          <span>Перепродажа</span>
        </div>
        <div className="region-btn">Регион RU</div>
      </header>

      <div className="main-content">
        {/* Левая панель */}
        <aside className="sidebar">
          <div className="item-card">
            <div className="item-image-box">
              <span role="img" aria-label="item">📦</span>
            </div>
            <h2>«Жестянка»</h2>
            <p className="item-type">ЛЕГЕНДА • ДРУГОЕ</p>
          </div>

          <div className="stats">
            <div className="stat-row">
              <span>ЛОТОВ СЕЙЧАС</span>
              <strong>47</strong>
            </div>
            <div className="stat-row">
              <span>МЕДИАНА ЦЕНЫ</span>
              <strong>233 333 ₽</strong>
            </div>
            <div className="stat-row">
              <span>МИН. ЦЕНА СДЕЛКИ</span>
              <strong>118 000 ₽</strong>
            </div>
            <div className="stat-row">
              <span>МАКС. ЦЕНА СДЕЛКИ</span>
              <strong>16 800 000 ₽</strong>
            </div>
            <div className="stat-row">
              <span>СДЕЛОК ЗА 30 ДНЕЙ</span>
              <strong>1 326</strong>
            </div>
          </div>

          <div className="actions">
            <button className="outline-btn">📋 Копировать название</button>
            <button className="outline-btn">☆ В избранное</button>
            <button className="outline-btn">👁 В мониторинг</button>
          </div>

          <div className="tabs">
            <div className="tab active">Аукцион</div>
            <div className="tab">История продаж</div>
          </div>
        </aside>

        {/* Правая часть (Контент) */}
        <main className="content">
          {/* Фильтры */}
          <div className="filters">
            <button className="filter-btn">Регион: RU ▼</button>
            <button className="filter-btn">Редкость: Все ▼</button>
            <button className="filter-btn">Заточка: Любая ▼</button>
          </div>

          {/* Блок с лучшей ценой */}
          <div className="summary-card">
            <div className="best-price-info">
              <span className="label">ЛУЧШАЯ ЦЕНА СЕЙЧАС</span>
              <div className="price-row">
                <span className="big-price">300 000 ₽</span>
                <span className="per-piece">за штуку</span>
                <span className="rank-tag">+28% К МЕДИАНЕ РАНГА</span>
              </div>
            </div>
            <div className="summary-details">
              <div className="detail-col">
                <span>ЛОТ ЦЕЛИКОМ</span>
                <strong>300 000 ₽</strong>
              </div>
              <div className="detail-col">
                <span>ШТУК</span>
                <strong>1</strong>
              </div>
              <div className="detail-col">
                <span>ОСТАЛОСЬ</span>
                <strong className="time-yellow">1д 22ч</strong>
              </div>
              <div className="detail-col text-right">
                <span>по всем 47 лотам</span>
                <button className="outline-btn small">📋 Копировать название</button>
              </div>
            </div>
          </div>

          {/* Таблица */}
          <div className="table-container">
            <div className="table-header-tools">
              <div>⇅ СОРТИРОВКА <span className="gray">порядок игры</span></div>
              <div className="gray">Shift + клик по заголовку — добавить уровень</div>
              <button className="outline-btn small">Несколько уровней</button>
            </div>

            <table className="lots-table">
              <thead>
                <tr>
                  <th>ЛОТ</th>
                  <th>ЗАТОЧКА</th>
                  <th>КОЛИЧЕСТВО</th>
                  <th>СТАВКА</th>
                  <th>ВЫКУП</th>
                  <th>ЗА ШТУКУ</th>
                  <th>К МЕДИАНЕ РАНГА</th>
                  <th>ОСТАЛОСЬ</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id}>
                    <td className="lot-name">
                      <span className="lot-icon">📦</span>
                      «Жестянка»
                      {lot.bestPrice && <span className="best-price-tag">ЛУЧШАЯ ЦЕНА</span>}
                    </td>
                    <td>—</td>
                    <td>{lot.quantity}</td>
                    <td>{lot.bid ? `${lot.bid.toLocaleString()} ₽` : '—'}</td>
                    <td>{lot.buyout ? `${lot.buyout.toLocaleString()} ₽` : '—'}</td>
                    <td className="bold-white">{lot.perPiece.toLocaleString()} ₽</td>
                    <td className={lot.rankColor}>{lot.rank}</td>
                    <td className={lot.time.includes(':') ? 'time-yellow' : ''}>{lot.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
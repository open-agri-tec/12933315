import React, { useEffect, useState } from 'react';
import './Header.css';

/**
 * アプリケーション共通のヘッダーコンポーネント。
 * ブランド名とサブタイトル、現在日時および季節を表示します。
 * 日時は20秒ごとに更新され、季節は月から判定されます。
 */
const Header: React.FC = () => {
  const [dateString, setDateString] = useState('');
  const [season, setSeason] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // 日本語形式で月日・曜日・時間を表示
      const fmt = new Intl.DateTimeFormat('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      // フォーマット後の文字列には空白が含まれるため、改行に変換
      setDateString(fmt.format(now));
      const m = now.getMonth() + 1;
      let s = '冬';
      if ([3, 4, 5].includes(m)) s = '春';
      else if ([6, 7, 8].includes(m)) s = '夏';
      else if ([9, 10, 11].includes(m)) s = '秋';
      setSeason(s);
    };
    update();
    const timer = setInterval(update, 1000 * 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="brand">
        <h1>ローカルAI育成システム</h1>
        <div className="sub">Local AI Farm</div>
      </div>
      <div className="clock">
        {/* 日付文字列内の空白を改行として解釈するためreplace */}
        {dateString.replace(' ', '\n')}
        <br />
        {season} / ローカル観測中
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import cn from 'classnames';

import style from './style.module.css';

interface IProps {
  value: string;
  icon: string;
  title: string;
  className?: string;
}

function Statistics({className = '', title, icon, value}: IProps) {
  return (
    <div className={cn(style.Statistics, className)} title={title}>
      <div className={style.emoji}>{icon}</div>
      <div className={style.value}>{value}</div>
    </div>
  );
}

export default React.memo(Statistics);

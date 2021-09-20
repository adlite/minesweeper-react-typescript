import React from 'react';
import cn from 'classnames';

import style from './style.module.css';

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export default function Field({className = '', children}: IProps) {
  return <div className={cn(style.Panel, className)}>{children}</div>;
}

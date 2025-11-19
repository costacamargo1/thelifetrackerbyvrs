import React from 'react';
import {
  ShoppingCartIcon,
  TruckIcon,
  BriefcaseIcon,
  HomeIcon,
  GiftIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  BoltIcon,
  HeartIcon,
  CakeIcon,
  AcademicCapIcon,
  TicketIcon,
  DevicePhoneMobileIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';

// Mapa de ícones para renderização dinâmica
export const iconMap: { [key: string]: React.FC<React.ComponentProps<'svg'>> } = {
  ShoppingCartIcon,
  TruckIcon,
  BriefcaseIcon,
  HomeIcon,
  GiftIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  BoltIcon,
  HeartIcon,
  CakeIcon,
  AcademicCapIcon,
  TicketIcon,
  DevicePhoneMobileIcon,
  QuestionMarkCircleIcon,
};

export const IconComponent: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = "w-6 h-6" }) => {
  const Icon = iconMap[iconName];
  // Usa um ícone padrão se o especificado não for encontrado
  return Icon ? <Icon className={className} /> : <QuestionMarkCircleIcon className={className} />;
};
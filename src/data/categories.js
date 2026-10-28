export const CATEGORIES = [
  { id: 'all', label: 'Все темы', icon: 'Sparkles', color: 'amber' },
  { id: 'childhood', label: 'Детство и юность', icon: 'Smile', color: 'amber' },
  { id: 'trade', label: 'Торговля и ярмарки', icon: 'ShoppingBag', color: 'emerald' },
  { id: 'changes', label: 'Снос и реконструкция', icon: 'History', color: 'rose' },
  { id: 'encounters', label: 'Встречи и свидания', icon: 'Users', color: 'blue' },
  { id: 'industry', label: 'Заводы и труд', icon: 'Factory', color: 'slate' },
  { id: 'folklore', label: 'Городские легенды', icon: 'BookOpen', color: 'purple' },
];

export const MATERIAL_TYPES = {
  memory: {
    label: 'Личное воспоминание',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    description: 'Личный субъективный опыт, сохраненный очевидцем или пересказанный близкими.'
  },
  archive: {
    label: 'Архивный документ / Хроника',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
    description: 'Официальные фотоснимки, вырезки из периодики и справки из архивов БССР.'
  },
  fact: {
    label: 'Краеведческий факт',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
    description: 'Подтвержденные даты, имена архитекторов и зафиксированные исторические события.'
  }
};

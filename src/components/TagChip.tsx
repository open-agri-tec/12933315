import React from 'react';

interface TagChipProps {
  label: string;
  tone?: 'growth' | 'feed' | 'danger' | 'neutral';
}

function resolveTone(label: string, tone?: TagChipProps['tone']): TagChipProps['tone'] {
  if (tone) return tone;
  if (['異常', '緊急'].includes(label)) return 'danger';
  if (['防除', '施肥', '収量', '経費'].includes(label)) return 'feed';
  if (['観察', '生育', '環境', '継続'].includes(label)) return 'growth';
  return 'neutral';
}

const TagChip: React.FC<TagChipProps> = ({ label, tone }) => {
  return <span className={`tag-chip tag-chip-${resolveTone(label, tone)}`}>{label}</span>;
};

export default TagChip;

type Variant = 'blue' | 'green' | 'purple' | 'orange' | 'pink';

const VARIANTS: Record<Variant, string> = {
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  pink:   'bg-pink-100 text-pink-700',
};

const VARIANT_ORDER: Variant[] = ['blue', 'green', 'purple', 'orange', 'pink'];

export function getVariantByIndex(i: number): Variant {
  return VARIANT_ORDER[i % VARIANT_ORDER.length];
}

interface BadgeProps {
  label:    string;
  variant?: Variant;
  size?:    'sm' | 'md';
}

export default function Badge({ label, variant = 'blue', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${VARIANTS[variant]}`}>
      {label}
    </span>
  );
}

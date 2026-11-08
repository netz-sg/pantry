import {
  Beef,
  Carrot,
  Cookie,
  Droplet,
  Egg,
  Fish,
  Milk,
  Package,
  Snowflake,
  Wheat,
  Wine,
} from 'lucide-react';
import { RowIcon } from '@/components/ui/list';

/** Farbiges Symbol passend zum Lebensmittel, wie in den iOS-Einstellungen. */
export function ExpiryIcon({ name, aisle }: { name: string; aisle?: string | null }) {
  const n = name.toLowerCase();
  if (/\bei(er)?\b|eier/.test(n))
    return (
      <RowIcon color="var(--orange)">
        <Egg />
      </RowIcon>
    );
  if (/milch|joghurt|sahne|quark/.test(n))
    return (
      <RowIcon color="var(--blue)">
        <Milk />
      </RowIcon>
    );
  if (/fisch|lachs|thunfisch/.test(n))
    return (
      <RowIcon color="#30B0C7">
        <Fish />
      </RowIcon>
    );
  switch (aisle) {
    case 'produce':
      return (
        <RowIcon color="var(--green)">
          <Carrot />
        </RowIcon>
      );
    case 'dairy':
      return (
        <RowIcon color="var(--blue)">
          <Droplet />
        </RowIcon>
      );
    case 'meat':
      return (
        <RowIcon color="var(--red)">
          <Beef />
        </RowIcon>
      );
    case 'frozen':
      return (
        <RowIcon color="#5AC8FA">
          <Snowflake />
        </RowIcon>
      );
    case 'dry':
    case 'bakery':
      return (
        <RowIcon color="#C69C6D">
          <Wheat />
        </RowIcon>
      );
    case 'drinks':
      return (
        <RowIcon color="#AF52DE">
          <Wine />
        </RowIcon>
      );
    case 'snacks':
      return (
        <RowIcon color="#FF2D55">
          <Cookie />
        </RowIcon>
      );
    default:
      return (
        <RowIcon color="#8E8E93">
          <Package />
        </RowIcon>
      );
  }
}

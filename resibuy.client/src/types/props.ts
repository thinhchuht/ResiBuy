import type { EventItem } from "./models";

export interface CarouselProps {
    items: EventItem[];
    baseWidth?: number;
    autoplay?: boolean;
    autoplayDelay?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
    round?: boolean;
  }
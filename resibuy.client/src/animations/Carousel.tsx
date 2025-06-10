import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, MotionValue } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { Box, Typography, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Carousel.css";
import type { EventItem } from "../types/models";



export interface CarouselProps {
  items: EventItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}



const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 };

const StyledCarouselContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
  margin: "0 auto",
  "&.round": {
    borderRadius: "50%",
  },
});

const StyledCarouselTrack = styled(motion.div)({
  display: "flex",
  gap: `${GAP}px`,
  position: "relative",
});

const StyledCarouselItem = styled(motion.div)(({ theme }) => ({
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  overflow: "hidden",
  "&.round": {
    borderRadius: "50%",
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "stretch",
    backgroundColor: theme.palette.grey[100]
  }
}));

const StyledIndicatorsContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: theme.spacing(2),
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: theme.spacing(1),
}));

const StyledIndicator = styled(motion.div)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme.palette.primary.main,
  cursor: "pointer",
  "&.inactive": {
    backgroundColor: theme.palette.grey[400],
  },
}));

const StyledCarouselContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
  color: theme.palette.common.white,
}));

const useCarouselTransform = (x: MotionValue<number>, index: number, trackItemOffset: number) => {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  return useTransform(x, range, outputRange, { clamp: false });
};

export default function Carousel({
  items,
  baseWidth = window.innerWidth * 0.8,
  autoplay = true,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}: CarouselProps): React.ReactElement {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Create transforms for each item
  const transform0 = useCarouselTransform(x, 0, trackItemOffset);
  const transform1 = useCarouselTransform(x, 1, trackItemOffset);
  const transform2 = useCarouselTransform(x, 2, trackItemOffset);
  const transform3 = useCarouselTransform(x, 3, trackItemOffset);
  const transform4 = useCarouselTransform(x, 4, trackItemOffset);
  const transform5 = useCarouselTransform(x, 5, trackItemOffset);

  const transforms = [transform0, transform1, transform2, transform3, transform4, transform5];

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [autoplay, autoplayDelay, isHovered, loop, items.length, carouselItems.length, pauseOnHover]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * (carouselItems.length - 1),
          right: 0,
        },
      };

  const handleItemClick = (storeId: string) => {
    navigate(`/shop/${storeId}`);
  };

  return (
    <StyledCarouselContainer
      ref={containerRef}
      className={round ? "round" : ""}
      sx={{
        marginBottom : "20px",
        width: "80vw",
        maxHeight: "300px",
        ...(round && { height: "80vw", maxHeight: "300px" }),
      }}>
      <StyledCarouselTrack
        drag="x"
        {...dragProps}
        style={{
          width: "100%",
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) + containerPadding }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}>
        {carouselItems.map((item: EventItem, index: number) => (
          <StyledCarouselItem
            key={item.id}
            className={round ? "round" : ""}
            style={{
              width: itemWidth,
              height: round ? itemWidth : "300px",
              maxHeight: "300px",
              rotateY: transforms[index],
              cursor: "pointer",
            }}
            onClick={() => handleItemClick(item.storeId)}
            transition={effectiveTransition}>
            <img src={item.image} alt={item.title || `Carousel item ${item.id}`} />
            {(item.title || item.description) && (
              <StyledCarouselContent>
                {item.title && (
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                )}
                {item.description && (
                  <Typography variant="body2">
                    {item.description}
                  </Typography>
                )}
              </StyledCarouselContent>
            )}
          </StyledCarouselItem>
        ))}
      </StyledCarouselTrack>
      <StyledIndicatorsContainer>
        {items.map((item: EventItem, index: number) => (
          <StyledIndicator
            key={item.id}
            className={currentIndex % items.length === index ? "active" : "inactive"}
            animate={{
              scale: currentIndex % items.length === index ? 1.2 : 1,
            }}
            onClick={() => setCurrentIndex(index)}
            transition={{ duration: 0.15 }}
          />
        ))}
      </StyledIndicatorsContainer>
    </StyledCarouselContainer>
  );
}

import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandle,
  BottomSheetHandleProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { useAppTheme } from '@/context/ThemeContext';
import { Typography } from './Typography';

export interface AppBottomSheetProps {
  snapPoints?: (string | number)[];
  initialIndex?: number;
  title?: string;
  scrollable?: boolean;
  children: React.ReactNode;
  onChange?: (index: number) => void;
  onClose?: () => void;
}

const AppBottomSheet = forwardRef<BottomSheet, AppBottomSheetProps>(
  (
    {
      snapPoints = ['40%', '80%'],
      initialIndex = -1,
      title,
      scrollable = false,
      children,
      onChange,
      onClose,
    },
    ref
  ) => {
    const { colors } = useAppTheme();

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    const renderHandle = useCallback(
      (props: BottomSheetHandleProps) => (
        <BottomSheetHandle
          {...props}
          style={[styles.handle, { backgroundColor: colors.surfaceElevated }]}
          indicatorStyle={[styles.indicator, { backgroundColor: colors.border }]}
        />
      ),
      [colors]
    );

    return (
      <BottomSheet
        ref={ref}
        index={initialIndex}
        snapPoints={memoizedSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleComponent={renderHandle}
        backgroundStyle={{
          backgroundColor: colors.surfaceElevated,
          borderRadius: BorderRadius['3xl'],
        }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
        onChange={onChange}
        onClose={onClose}
      >
        {scrollable ? (
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {title && (
              <Typography variant="h4" style={styles.title}>
                {title}
              </Typography>
            )}
            {children}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={styles.content}>
            {title && (
              <Typography variant="h4" style={styles.title}>
                {title}
              </Typography>
            )}
            {children}
          </BottomSheetView>
        )}
      </BottomSheet>
    );
  }
);

AppBottomSheet.displayName = 'AppBottomSheet';

export { AppBottomSheet };

const styles = StyleSheet.create({
  handle: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    paddingTop: Spacing.sm,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  title: {
    marginBottom: Spacing.md,
  },
});

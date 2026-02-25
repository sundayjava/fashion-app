import { BorderRadius } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    View
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Three slot configs: front (0), mid (1), back (2)
const SLOT_CONFIG = [
    { rotate: -3, tx: 0, ty: 0, scale: 1.0 },
    { rotate: -13, tx: -14, ty: 6, scale: 0.93 },
    { rotate: -8, tx: 22, ty: 12, scale: 0.88 },
];
const SLOT_Z = [3, 2, 1];
const CARD_IMAGES = [
    require('@/assets/locals/onboading_images/third.webp'),
    require('@/assets/locals/onboading_images/first.webp'),
    require('@/assets/locals/onboading_images/second.webp'),
];

const CARD_EASE = Easing.inOut(Easing.cubic);
const CARD_DURATION = 900;

function useCardAnim(initialSlot: number) {
    const cfg = SLOT_CONFIG[initialSlot];
    const rotate = useSharedValue(cfg.rotate);
    const tx = useSharedValue(cfg.tx);
    const ty = useSharedValue(cfg.ty);
    const scale = useSharedValue(cfg.scale);

    const animStyle = useAnimatedStyle(() => ({
        transform: [
            { rotate: `${rotate.value}deg` },
            { translateX: tx.value },
            { translateY: ty.value },
            { scale: scale.value },
        ],
    }));

    const animateTo = (slot: number) => {
        'worklet';
        const cfg2 = SLOT_CONFIG[slot];
        rotate.value = withTiming(cfg2.rotate, { duration: CARD_DURATION, easing: CARD_EASE });
        tx.value = withTiming(cfg2.tx, { duration: CARD_DURATION, easing: CARD_EASE });
        ty.value = withTiming(cfg2.ty, { duration: CARD_DURATION, easing: CARD_EASE });
        scale.value = withTiming(cfg2.scale, { duration: CARD_DURATION, easing: CARD_EASE });
    };

    return { animStyle, animateTo };
}

export const AnimatedCardStack = () => {
    const slotsRef = useRef([0, 1, 2]);
    const [zSlots, setZSlots] = useState([0, 1, 2]);

    const card0 = useCardAnim(0);
    const card1 = useCardAnim(1);
    const card2 = useCardAnim(2);
    const cards = [card0, card1, card2];

    useFocusEffect(
        useCallback(() => {
            const interval = setInterval(() => {
                const newSlots = slotsRef.current.map((s) => (s + 1) % 3);
                slotsRef.current = newSlots;

                newSlots.forEach((slot, idx) => {
                    cards[idx].animateTo(slot);
                });

                // Update z-index on JS thread (doesn't cause animation jitter)
                runOnJS(setZSlots)([...newSlots]);
            }, 3000);

            return () => clearInterval(interval);
        }, [])
    );

    return (
        <View style={styles.cardStack}>
            {[0, 1, 2].map((cardIdx) => (
                <Animated.View
                    key={cardIdx}
                    style={[
                        styles.cardBase,
                        { zIndex: SLOT_Z[zSlots[cardIdx]] },
                        cards[cardIdx].animStyle,
                    ]}
                >
                    <Image
                        source={CARD_IMAGES[cardIdx]}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                </Animated.View>
            ))}
        </View>
    );
}

const CARD_W = width * 0.65;
const CARD_H = CARD_W * 1.28;

const styles = StyleSheet.create({
    cardStack: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardBase: {
        width: CARD_W,
        height: CARD_H,
        borderRadius: BorderRadius['2xl'],
        position: 'absolute',
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
    },
    cardImage: {
        width: CARD_W,
        height: CARD_H,
    },
})
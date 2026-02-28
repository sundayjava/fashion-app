import { GlassButton, ScreenWrapper } from "@/components/ui";
import { Spacing } from "@/constants";
import { useRouter } from "expo-router";
import { Platform, View } from "react-native";

export const Notes = () => {
    const router = useRouter();
    return (
        <ScreenWrapper
            padded
            keyboardAvoiding
            keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
            style={{ paddingVertical: Spacing.md }}
        >
            <View>
                <GlassButton
                    variant="glass"
                    label="Add Measurement Note"
                    fullWidth
                    loading={false}
                    onPress={() => router.push('/add-note')}
                />
            </View>
        </ScreenWrapper>
    );
}
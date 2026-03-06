import { Typography } from "@/components/ui";
import { View } from "react-native";

export const SeachComponent = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h4" weight="bold">
                Search Screen
            </Typography>
        </View>
    );
}
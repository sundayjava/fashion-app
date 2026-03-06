import { Typography } from "@/components/ui";
import { View } from "react-native";

export const NotificationComponent = () => {
    return (
        <View>
            <Typography variant="h4" weight="bold" >
                Notifications
            </Typography>
            <Typography variant="body" >
                You have no new notifications.
            </Typography>
        </View>
    );
}
import {NativeTabs} from 'expo-router/unstable-native-tabs';
import {useColorScheme} from 'react-native';

import {Colors} from '@/constants/theme';

export default function AppTabs() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

    return (
        <NativeTabs
            backgroundColor={colors.background}
            indicatorColor={colors.backgroundElement}
            labelStyle={{selected: {color: colors.text}}}>

            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/home.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>


            <NativeTabs.Trigger name="explore">
                <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    src={require('@/assets/images/tabIcons/explore.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="login">
                <NativeTabs.Trigger.Label>Login</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="register">
                <NativeTabs.Trigger.Label>Register</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trips">
                <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/join">
                <NativeTabs.Trigger.Label>Join</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/newTrip">
                <NativeTabs.Trigger.Label>New trip</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/index">
                <NativeTabs.Trigger.Label>Trip</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/expenses/new">
                <NativeTabs.Trigger.Label>newExpense</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/expenses/[expenseId]/index">
                <NativeTabs.Trigger.Label>Expense</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/expenses/[expenseId]/editing">
                <NativeTabs.Trigger.Label>ExpenseEditing</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/expenseDetail">
                <NativeTabs.Trigger.Label>ExpenseDetail</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/settle">
                <NativeTabs.Trigger.Label>settle</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="trip/[id]/member">
                <NativeTabs.Trigger.Label>Member</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    // src={require('@/assets/images/icon.png')}
                    renderingMode="template"
                />
            </NativeTabs.Trigger>

        </NativeTabs>
    );
}
